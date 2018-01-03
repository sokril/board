/**
 * Created by liyanq on 04/12/2017.
 */

import { Component, EventEmitter, Input, Output, OnInit } from "@angular/core"
import { Service } from "../../service";
import { K8sService } from "../../service.k8s";
import { MessageService } from "../../../shared/message-service/message.service";
import { SERVICE_STATUS } from "../../../shared/shared.const";
import { ImageIndex } from "../../service-step.component";
import { ImageDetail } from "../../../image/image";

enum ScaleMethod {smNone, smManually, smAuto}

enum ActionMethod {scale, update}

@Component({
  selector: "service-control",
  styleUrls: ["./service-control.component.css"],
  templateUrl: "./service-control.component.html"
})
export class ServiceControlComponent implements OnInit {
  _isOpen: boolean = false;
  dropDownListNum: Array<number>;
  scaleModule: ScaleMethod = ScaleMethod.smNone;
  scaleNum: number = 0;
  isActionInWIP: boolean = false;
  isGetServiceImagesWIP: boolean = false;
  isGetServiceImagesTagWIP: boolean = false;
  actionMethod: ActionMethod = ActionMethod.scale;
  imageList: Array<ImageIndex>;
  imageTagList: Map<string, Array<ImageDetail>>;
  imageTagSelected: Map<string, string>;
  @Input() service: Service;

  constructor(private k8sService: K8sService,
              private messageService: MessageService) {
    this.dropDownListNum = Array<number>();
    this.imageList = Array<ImageIndex>();
    this.imageTagList = new Map<string, Array<ImageDetail>>();
    this.imageTagSelected = new Map<string, string>();
  }

  ngOnInit() {
    for (let i = 1; i <= 100; i++) {
      this.dropDownListNum.push(i)
    }
  }

  @Output() isOpenChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input() get isOpen() {
    return this._isOpen;
  }

  set isOpen(open: boolean) {
    this._isOpen = open;
    this.isOpenChange.emit(this._isOpen);
  }

  get reason(): string {
    let result: string = this.service["service_comment"];
    if (result.toLowerCase().startsWith("reason:")) {
      result = result.slice(7)
    }
    return result;
  }

  getServiceStatus(status: SERVICE_STATUS): string {
    switch (status) {
      case SERVICE_STATUS.PREPARING:
        return 'SERVICE.STATUS_PREPARING';
      case SERVICE_STATUS.RUNNING:
        return 'SERVICE.STATUS_RUNNING';
      case SERVICE_STATUS.STOPPED:
        return 'SERVICE.STATUS_STOPPED';
      case SERVICE_STATUS.WARNING:
        return 'SERVICE.STATUS_UNCOMPLETED';
    }
  }

  getStatusClass(status: SERVICE_STATUS) {
    return {
      'running': status == SERVICE_STATUS.RUNNING,
      'stopped': status == SERVICE_STATUS.STOPPED,
      'warning': status == SERVICE_STATUS.WARNING
    }
  }

  setScaleMethod(scaleMethod: ScaleMethod): void {
    this.scaleModule = scaleMethod;
  }

  defaultDispatchErr(err) {
    this.isOpen = false;
    this.messageService.dispatchError(err);
  }

  get actionEnable(): boolean {
    let noImageTag: boolean = false;
    this.imageList.forEach(value => {
      let tagList = this.imageTagList.get(value.image_name);
      if (!tagList || tagList.length == 0) {
        noImageTag = true;
      }
    });
    let isCanUpdate = !this.isGetServiceImagesTagWIP && !noImageTag;
    return this.actionMethod == ActionMethod.update ? isCanUpdate : true;
  }

  getServiceImages() {
    this.isGetServiceImagesWIP = true;
    this.imageTagSelected.clear();
    this.imageList.splice(0, this.imageList.length);
    this.k8sService.getServiceImages(this.service.service_project_name, this.service.service_name)
      .then(res => {
        this.imageList = res;
        this.imageList.forEach(value => {
          this.imageTagSelected.set(value.image_name, value.image_tag);
          this.k8sService.getImageDetailList(value.image_name)
            .then(res => this.imageTagList.set(value.image_name, res))
            .catch(this.defaultDispatchErr);
        });
        this.isGetServiceImagesWIP = false;
      })
      .catch(this.defaultDispatchErr.bind(this))
  }

  updateServiceImages() {
    this.isActionInWIP = true;
    this.k8sService.updateServiceImages(this.service.service_project_name, this.service.service_name, this.imageList)
      .then(() => this.isOpen = false)
      .catch(this.defaultDispatchErr.bind(this))
  }

  setServiceScale() {
    this.isActionInWIP = true;
    this.k8sService.setServiceScale(this.service.service_id, this.scaleNum)
      .then(() => this.isOpen = false)
      .catch(this.defaultDispatchErr.bind(this))
  }

  actionExecute() {
    if (this.actionMethod == ActionMethod.update) {
      this.imageList.map(value => value.image_tag = this.imageTagSelected.get(value.image_name));
      this.updateServiceImages();
    } else {
      this.setServiceScale();
    }
  }

  changeImageTag(imageName: string, imageDetail: ImageDetail) {
    this.imageTagSelected.set(imageName, imageDetail.image_tag);
  }
}