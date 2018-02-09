import { Injectable } from "@angular/core";
import { HttpClient, HttpEvent, HttpRequest, HttpResponse } from "@angular/common/http";
import { BuildImageData, Image, ImageDetail } from "../image";
import { Project } from "app/project/project";
import { Observable } from "rxjs/Observable";

@Injectable()
export class ImageService {
  constructor(private http: HttpClient) {
  }

  uploadFile(formData: FormData): Observable<HttpEvent<Object>> {
    const req = new HttpRequest('POST', `/api/v1/files/upload`, formData, {
      reportProgress: true,
    });
    return this.http.request<Object>(req)
  }

  getProjects(projectName: string = ""): Promise<Project[]> {
    return this.http.get<Project[]>('/api/v1/projects', {
      observe: "response",
      params: {'project_name': projectName, 'member_only': "1"}
    }).toPromise()
      .then((res: HttpResponse<Project[]>) => res.body || [])
  }

  uploadDockerFile(formData: FormData): Promise<any> {
    return this.http.post(`/api/v1/images/dockerfile/upload`, formData, {observe: "response"}).toPromise()
  }

  downloadDockerFile(fileInfo: {imageName: string, tagName: string, projectName: string}): Promise<any> {
    return this.http.get(`/api/v1/images/dockerfile/download`,
      {
        observe: "response",
        responseType:"text",
        params: {
          image_name: fileInfo.imageName,
          tag_name: fileInfo.tagName,
          project_name: fileInfo.projectName
        }
      }).toPromise()
  }


  removeFile(formData: FormData): Promise<any> {
    return this.http.post(`/api/v1/files/remove`, formData, {observe: "response"}).toPromise()
  }

  cancelConsole(jobName: string): Promise<any> {
    return this.http
      .get(`/api/v1/jenkins-job/stop`, {
        observe: "response",
        params: {
          "job_name": jobName
        }
      }).toPromise()
  }

  buildImageFromTemp(imageData: BuildImageData): Promise<any> {
    return this.http.post(`/api/v1/images/building`, imageData, {observe: "response"}).toPromise()
  }

  buildImageFromDockerFile(fileInfo: {imageName: string, tagName: string, projectName: string}): Promise<any> {
    return this.http.post(`/api/v1/images/dockerfilebuilding`, fileInfo, {
      observe: "response",
      params: {
        image_name: fileInfo.imageName,
        image_tag: fileInfo.tagName,
        project_name: fileInfo.projectName
      }
    }).toPromise()
  }

  getFileList(formData: FormData): Promise<Array<{path: string, file_name: string, size: number}>> {
    return this.http.post(`/api/v1/files/list`, formData, {observe: "response"})
      .toPromise()
      .then(res => res.body as Array<{path: string, file_name: string, size: number}>)
  }

  getDockerFilePreview(imageData: BuildImageData): Promise<string> {
    return this.http.post(`/api/v1/images/preview`, imageData, {observe: "response", responseType: 'text'})
      .toPromise()
      .then(res => res.body)
  }

  getImages(image_name?: string, image_list_page?: number, image_list_page_size?: number): Promise<Image[]> {
    return this.http.get<Image[]>("/api/v1/images", {
      observe: "response",
      params: {
        'image_name': image_name,
        'image_list_page': image_list_page.toString(),
        'image_list_page_size': image_list_page_size.toString()
      }
    }).toPromise()
      .then((res: HttpResponse<Image[]>) => res.body || [])
  }

  getImageDetailList(image_name: string): Promise<ImageDetail[]> {
    return this.http.get<ImageDetail[]>(`/api/v1/images/${image_name}`, {observe: "response"})
      .toPromise()
      .then((res: HttpResponse<ImageDetail[]>) => res.body || [])
  }

  deleteImages(imageName: string): Promise<any> {
    return this.http
      .delete(`/api/v1/images`, {
        observe: "response",
        params: {image_name: imageName}
      })
      .toPromise()
  }

  deleteImageTag(imageName: string, imageTag: string): Promise<any> {
    return this.http
      .delete(`/api/v1/images/${imageName}`, {
        observe: "response",
        params: {image_tag: imageTag}
      })
      .toPromise()
  }

  checkImageExist(projectName: string, imageName: string, imageTag: string): Promise<any> {
    return this.http.get(`/api/v1/images/${imageName}/existing`, {
      observe: "response",
      params: {image_tag: imageTag, project_name: projectName}
    }).toPromise()
  }

  getBoardRegistry(): Observable<HttpResponse<string>> {
    return this.http.get(`/api/v1/images/registry`, {observe: "response", responseType: "text"})
  }
}