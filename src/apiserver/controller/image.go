package controller

import (
	"encoding/json"
	"fmt"
	"git/inspursoft/board/src/apiserver/service"
	"git/inspursoft/board/src/common/model"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	//"strings"
	"path/filepath"
	"time"

	"github.com/astaxie/beego/logs"
)

type ImageController struct {
	baseController
}

var RegistryIp string
var RegistryStatus bool
var commentTemp = "Inspur image" // TODO: get from mysql in the next release
var sizeunitTemp = "B"

var defaultDockerfilename = "Dockerfile"
var imageProcess = "process_image"

func init() {
	var registryip = os.Getenv("REGISTRY_HOST")
	var registryport = os.Getenv("REGISTRY_PORT")
	RegistryIp = "http://" + registryip + ":" + registryport

	_, err := http.Get(RegistryIp + "/v2/")
	if err != nil {
		RegistryStatus = false
	} else {
		RegistryStatus = true
	}
	log.Printf("%s\t%s\t%s\t", "RegistryStatus status is ", strconv.FormatBool(RegistryStatus), time.Now())
}

// API to get image list
func (p *ImageController) GetImagesAction() {

	var repolist model.RegistryRepo

	// Get the image list from registry v2
	httpresp, err := http.Get(RegistryIp + "/v2/_catalog")
	if err != nil {
		p.internalError(err)
		return
	}

	body, err := ioutil.ReadAll(httpresp.Body)
	if err != nil {
		p.internalError(err)
		return
	}

	err = json.Unmarshal(body, &repolist)
	if err != nil {
		fmt.Println(body)
		p.internalError(err)
		return
	}

	// fmt.Println(repolist)
	/* Interpret the message to api server */
	var imagelist []model.Image
	for _, imagename := range repolist.Names {
		var newImage model.Image
		newImage.ImageName = imagename
		newImage.ImageComment = commentTemp
		//fmt.Println(newImage)
		imagelist = append(imagelist, newImage)
	}
	fmt.Println(imagelist)
	p.Data["json"] = imagelist
	p.ServeJSON()
}

// API to get tag list for a specific image
func (p *ImageController) GetImageDetailAction() {

	var taglist model.RegistryTags

	imageName := p.Ctx.Input.Param(":imagename")

	gettagsurl := "/v2/" + imageName + "/tags/list"

	httpresp, err := http.Get(RegistryIp + gettagsurl)
	if err != nil {
		fmt.Println("url=", gettagsurl)
		p.internalError(err)
		return
	}

	body, err := ioutil.ReadAll(httpresp.Body)
	if err != nil {
		p.internalError(err)
		return
	}

	err = json.Unmarshal(body, &taglist)
	if err != nil {
		fmt.Println(string(body))
		p.internalError(err)
		return
	}
	//fmt.Println(taglist)

	var imagedetail []model.TagDetail
	for _, tagid := range taglist.Tags {
		var tagdetail model.TagDetail
		tagdetail.ImageName = taglist.ImageName
		tagdetail.ImageTag = tagid
		tagdetail.ImageSizeUnit = sizeunitTemp

		// Get version one schema
		getmenifesturl := "/v2/" + taglist.ImageName + "/manifests/" + tagid
		httpresp, err = http.Get(RegistryIp + getmenifesturl)
		if err != nil {
			fmt.Println(getmenifesturl)
			p.internalError(err)
			return
		}

		body, err = ioutil.ReadAll(httpresp.Body)
		if err != nil {
			p.internalError(err)
			return
		}

		var menifest1 model.RegistryMenifest1
		err = json.Unmarshal(body, &menifest1)
		if err != nil {
			fmt.Println(string(body))
			p.internalError(err)
			return
		}

		//fmt.Println((menifest1.History[0])["v1Compatibility"])

		// Interpret it on the frontend
		tagdetail.ImageDetail = (menifest1.History[0])["v1Compatibility"]
		tagdetail.ImageAuthor = ""       //TODO: get the author by frontend simply
		tagdetail.ImageCreationTime = "" //TODO: get the time by frontend simply

		// Get version two schema
		getmenifesturl = RegistryIp + getmenifesturl
		req, _ := http.NewRequest("GET", getmenifesturl, nil)
		req.Header.Set("Accept", "application/vnd.docker.distribution.manifest.v2+json")
		client := http.Client{}
		httpresp, err = client.Do(req)

		body, err = ioutil.ReadAll(httpresp.Body)
		if err != nil {
			p.internalError(err)
			return
		}

		var menifest2 model.RegistryMenifest2
		err = json.Unmarshal(body, &menifest2)
		if err != nil {
			fmt.Println(string(body))
			p.internalError(err)
			return
		}

		tagdetail.ImageId = menifest2.Config.Digest
		tagdetail.ImageSize = menifest2.Config.Size

		var layerconfig model.Menifest2Config
		for _, layerconfig = range menifest2.Layers {
			tagdetail.ImageSize += layerconfig.Size
		}

		// Add the tag detail to list
		imagedetail = append(imagedetail, tagdetail)

	}
	fmt.Println(imagedetail)
	p.Data["json"] = imagedetail
	p.ServeJSON()

}

//  Checking the user priviledge by token
func (p *ImageController) Prepare() {
	user := p.getCurrentUser()
	if user == nil {
		p.CustomAbort(http.StatusUnauthorized, "Need to login first.")
		return
	}
	p.currentUser = user
	p.isSysAdmin = (user.SystemAdmin == 1)
	p.isProjectAdmin = (user.ProjectAdmin == 1)
}

func (p *ImageController) BuildImageAction() {
	var err error

	//Check user priviledge project admin
	if p.isProjectAdmin == false {
		p.serveStatus(http.StatusForbidden, "Invalid user for project admin")
		return
	}

	reqData, err := p.resolveBody()
	if err != nil {
		p.internalError(err)
		return
	}

	var reqImageConfig model.ImageConfig
	err = json.Unmarshal(reqData, &reqImageConfig)
	if err != nil {
		p.internalError(err)
		return
	}

	//Checking invalid parameters
	err = service.CheckDockerfileConfig(reqImageConfig)
	if err != nil {
		p.internalError(err)
		return
	}

	var dockerfilepath = filepath.Join(repoPath, reqImageConfig.ProjectName,
		reqImageConfig.ImageName, reqImageConfig.ImageTag)
	service.SetDockerfilePath(dockerfilepath)

	err = service.BuildDockerfile(reqImageConfig)
	if err != nil {
		p.internalError(err)
		return
	}

	//push to git
	var pushobject pushObject

	pushobject.FileName = defaultDockerfilename
	pushobject.JobName = imageProcess
	pushobject.Value = filepath.Join(reqImageConfig.ProjectName,
		reqImageConfig.ImageName, reqImageConfig.ImageTag)
	pushobject.Extras = filepath.Join(reqImageConfig.ProjectName,
		reqImageConfig.ImageName) + ":" + reqImageConfig.ImageTag
	pushobject.Message = fmt.Sprintf("Build image: %s", pushobject.Extras)

	//Get file list for Jenkis git repo
	uploads, err := service.ListUploadFiles(dockerfilepath)
	if err != nil {
		p.internalError(err)
		return
	}
	for _, finfo := range uploads {
		filefullname := filepath.Join(pushobject.Value, finfo.FileName)
		pushobject.Items = append(pushobject.Items, filefullname)
	}

	ret, msg, err := InternalPushObjects(&pushobject, &(p.baseController))
	if err != nil {
		p.internalError(err)
		return
	}
	logs.Info("Internal push object: %d %s", ret, msg)
	p.CustomAbort(ret, msg)
}

//TODO
func (p *ImageController) GetImageDockerfileAction() {

	p.serveStatus(200, "Get dockerfile successfully")
	return
}

//TODO
func (p *ImageController) GetImagePreviewAction() {

	p.serveStatus(200, "Get preview successfully")
	return
}
