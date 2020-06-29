import { HttpBase, HttpBind, HttpBindArray } from '../shared/ui-model/model-types';

export enum NodeStatusType {
  Schedulable = 1, Unschedulable, Unknown
}

export class  NodeStatus extends HttpBase {
  readonly masterKey = 'node-role.kubernetes.io/master';
  @HttpBind('node_name') nodeName: string;
  @HttpBind('node_ip') nodeIp: string;
  @HttpBind('node_type') nodeType = '';
  @HttpBind('create_time') createTime: number;
  @HttpBind('status') status: NodeStatusType;
  @HttpBind('labels') labels: { [p: string]: string };

  get isMaster(): boolean {
    return Reflect.has(this.labels, this.masterKey);
  }
}

export class NodeGroupStatus extends HttpBase {
  projectName = '';
  @HttpBind('nodegroup_id') id: number;
  @HttpBind('nodegroup_name') name: string;
  @HttpBind('nodegroup_comment') comment: string;
  @HttpBind('nodegroup_owner_id') ownerId: number;
  @HttpBind('nodegroup_creation_time') creationTime: string;
  @HttpBind('nodegroup_update_time') updateTime: string;
  @HttpBind('nodegroup_deleted') deleted: number;

  postBody(): { [p: string]: string } {
    return {
      nodegroup_project: this.projectName,
      nodegroup_name: this.name,
      nodegroup_comment: this.comment
    };
  }
}

export class ServiceInstance extends HttpBase {
  @HttpBind('project_name') projectName: string;
  @HttpBind('service_instance_name') serviceInstanceName: string;
}

export class NodeControlStatus extends HttpBase {
  @HttpBind('node_name') nodeName: string;
  @HttpBind('node_ip') nodeIp: string;
  @HttpBind('node_phase') nodePhase: string;
  @HttpBind('node_deletable') deletable: boolean;
  @HttpBind('node_unschedulable') nodeUnschedulable: boolean;
  @HttpBindArray('service_instances', ServiceInstance) serviceInstances: Array<ServiceInstance>;

  prepareInit() {
    super.prepareInit();
    this.serviceInstances = Array<ServiceInstance>();
  }
}

export class NodeDetail extends HttpBase {
  @HttpBind('node_name') nodeName: string;
  @HttpBind('node_ip') nodeIp: string;
  @HttpBind('create_time') createTime: number;
  @HttpBind('memory_size') memorySize: string;
  @HttpBind('cpu_usage') cpuUsage: number;
  @HttpBind('memory_usage') memoryUsage: number;
  @HttpBind('storage_total') storageTotal: string;
  @HttpBind('storage_use') storageUse: string;
}

export class EdgeNode extends HttpBase {
  @HttpBind('name') name = '';
  @HttpBind('node_ip') nodeIp = '';
  @HttpBind('node_password') nodePassword = '';
  @HttpBind('cpu_type') cpuType = '';
  @HttpBind('master') master = '';
  @HttpBind('registry_mode') registryMode = '';
}
