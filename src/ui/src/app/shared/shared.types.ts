import { HttpErrorResponse } from "@angular/common/http";
import { Type } from "@angular/core";
import { TimeoutError } from "rxjs/src/util/TimeoutError";

export interface ICsMenuItemData {
  caption: string,
  icon: string,
  url: string,
  visible: boolean,
  children?: Array<ICsMenuItemData>
}

export enum RETURN_STATUS {
  rsNone, rsConfirm, rsCancel
}

export enum EXECUTE_STATUS {
  esNotExe = 'NotExe', esExecuting = 'Executing', esSuccess = 'Success', esFailed = 'Failed'
}

export enum BUTTON_STYLE {
  CONFIRMATION = 1, DELETION, YES_NO, ONLY_CONFIRM
}

export class Message {
  title: string = '';
  message: string = '';
  data: any;
  buttonStyle: BUTTON_STYLE = BUTTON_STYLE.CONFIRMATION;
  returnStatus: RETURN_STATUS = RETURN_STATUS.rsNone;
}

export type AlertType = 'alert-success' | 'alert-danger' | 'alert-info' | 'alert-warning';
export type DropdownMenuPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';

export interface IDropdownTag {
  type: AlertType,
  description: string
}

export class AlertMessage {
  message: string = '';
  alertType: AlertType = 'alert-success';
}

export enum GlobalAlertType {
  gatNormal, gatShowDetail, gatLogin
}

export class GlobalAlertMessage {
  type: GlobalAlertType = GlobalAlertType.gatNormal;
  message: string = '';
  alertType: AlertType = 'alert-danger';
  errorObject: HttpErrorResponse | Type<Error> | TimeoutError;
  endMessage: string = '';
}

export class SignUp {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  realname: string;
  comment: string;
}

export interface INode {
  node_name: string;
  node_ip: string;
  status: number;
}

export interface INodeGroup {
  nodegroup_id: number,
  nodegroup_project: string,
  nodegroup_name: string,
  nodegroup_comment: string;
}

export class NodeAvailableResources {
  node_id: number = 0;
  node_name: string = '';
  cpu_available: string = '';
  mem_available: string = '';
  storage_available: string = '';
}

export class ServiceHPA {
  hpa_id: number;     //The hpa ID of this autoscale. ,
  hpa_name: string = '';   //The hpa name of this autoscale. ,
  hpa_status: number = 0;
  service_id: number; //The service ID of this hpa to control. ,
  min_pod: number = 1;     //The minimum pod number. ,
  max_pod: number = 1;     //The maximum pod number. ,
  cpu_percent: number = 0;//The target CPU percentage.
  isEdit: boolean = false;
}

export class SystemInfo {
  board_host = '';
  auth_mode = '';
  set_auth_password = '';
  init_project_repo = '';
  sync_k8s = '';
  redirection_url = '';
  board_version = '';

  constructor() {
  }
}

export class User {
  public user_id = 0;
  public user_name = '';
  public user_email = '';
  public user_password = '';
  public user_confirm_password = '';
  public user_realname = '';
  public user_comment = '';
  public user_deleted = 0;
  public user_system_admin = 0;
  public user_reset_uuid = '';
  public user_salt: string = '';
  public user_creation_time: Date;
  public user_update_time: Date;

  constructor() {
    this.user_creation_time = new Date();
    this.user_update_time = new Date();
  }
}

export enum DragStatus {
  dsReady = 'ready', dsStart = 'start', dsDragIng = 'drag', dsEnd = 'end'
}

export enum CreateImageMethod{None, Template, DockerFile, DevOps}

export class PersistentVolumeOptions {
  public path = '';
  public server = '';
}

export class PersistentVolumeOptionsRBD {
  public user = '';
  public keyring = '';
  public pool = 'rbd';
  public image = '';
  public fstype = '';
  public secretname = '';
  public secretnamespace = '';
  public monitors = '';
}

export enum PvAccessMode {
  ReadWriteOnce = 'ReadWriteOnce',
  ReadOnlyMany = 'ReadOnlyMany',
  ReadWriteMany = 'ReadWriteMany'
}

export enum PvReclaimMode {
  Retain = 'Retain',
  Recycle = 'Recycle',
  Delete = 'Delete'
}

export class PersistentVolume {
  public id = 0;
  public name = '';
  public type = 0;
  public state = 0;
  public capacity = '';
  public accessMode = PvAccessMode;
  public reclaim = PvReclaimMode;

  get typeDescription(): string {
    return ['Unknown', 'NFS', 'RBD'][this.type];
  }

  get statusDescription(): string{
    return ['Unknown', 'Available', 'Bound', 'Released', 'Failed', 'Invalid'][this.state];
  }

  postObject(): Object {
    return {
      pv_name: this.name,
      pv_capacity: this.capacity,
      pv_type: this.type,
      pv_accessmode: this.accessMode,
      pv_reclaim: this.reclaim
    }
  }
}

export class NFSPersistentVolume extends PersistentVolume {
  public options: PersistentVolumeOptions;

  constructor() {
    super();
    this.options = new PersistentVolumeOptions();
  }

  postObject(): Object {
    let result = super.postObject();
    Reflect.set(result, 'pv_options', this.options);
    return result;
  }
}

export class RBDPersistentVolume extends PersistentVolume {
  public options: PersistentVolumeOptionsRBD;

  constructor() {
    super();
    this.options = new PersistentVolumeOptionsRBD();
  }

  postObject(): Object {
    let result = super.postObject();
    Reflect.set(result, 'pv_options', this.options);
    return result;
  }
}