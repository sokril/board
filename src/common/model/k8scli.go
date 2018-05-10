package model

import (
	"time"
)

type Node struct {
	NodeName      string
	NodeIP        string
	CreateTime    int64
	Unschedulable bool
	Groups        map[string]string
}

type NodeList struct {
	Items []Node
}

type Namespace struct {
	Name              string
	CreationTimestamp time.Time
	NamespacePhase    string
}

type NamespaceList struct {
	Items []Namespace
}

type ServicePort struct {
	Name       string
	Protocol   string
	Port       int32
	TargetPort int32
	NodePort   int32
}

type Service struct {
	Name                       string
	GenerateName               string
	Namespace                  string
	ResourceVersion            string
	Generation                 int64
	CreationTimestamp          time.Time
	DeletionTimestamp          time.Time
	DeletionGracePeriodSeconds int64
	Labels                     map[string]string
	ClusterName                string
	Ports                      []ServicePort
	Selector                   map[string]string
	ClusterIP                  string
	Type                       string
	ExternalIPs                []string
	//SessionAffinity ServiceAffinity
	ExternalName string
}

type ServiceList struct {
	Items []Service
}

type ScaleState struct {
	Replicas       int32
	Selector       map[string]string
	TargetSelector string
}

// represents a scaling request for a resource.
type Scale struct {
	Name      string
	Namespace string
	Labels    map[string]string
	Replicas  int32
	Status    ScaleState
}

// DeploymentStatus is the most recently observed status of the Deployment.
type DeploymentStatus struct {
	Replicas            int32
	UpdatedReplicas     int32
	AvailableReplicas   int32
	UnavailableReplicas int32
}

// DeploymentSpec is the specification of the desired behavior of the Deployment.
type DeploymentSpec struct {
	Replicas int32
	Selector map[string]string
	//Template v1.PodTemplateSpec //TODO to define pod struct
	Paused bool //TODO for pause
	//RollbackTo *RollbackConfig //TODO
}

type Deployment struct {
	Name                       string
	Namespace                  string
	Labels                     map[string]string
	CreationTimestamp          time.Time
	DeletionTimestamp          time.Time
	DeletionGracePeriodSeconds int64
	Spec                       DeploymentSpec   `json:"spec,omitempty" protobuf:"bytes,2,opt,name=spec"`
	Status                     DeploymentStatus `json:"status,omitempty" protobuf:"bytes,3,opt,name=status"`
}

type DeploymentList struct {
	Items []Deployment
}

// NodeCli Interface has methods to work with Node resources in k8s-assist.
// How to:  nodeCli, err := k8sassist.NewInterfaces()
type NodeCli interface {
	Create(*Node) (*Node, error)
	Update(*Node) (*Node, error)
	UpdateStatus(*Node) (*Node, error)
	Delete(name string) error
	Get(name string) (*Node, error)
	List() (*NodeList, error)
	//Patch(name string, pt api.PatchType, data []byte, subresources ...string) (result *v1.Node, err error)
}

// DeploymentCli has methods to work with Deployment resources in k8s-assist.
// How to:  deploymentCli, err := k8sassist.NewDeployments(nameSpace)
type DeploymentCli interface {
	Create(*Deployment) (*Deployment, error)
	Update(*Deployment) (*Deployment, error)
	UpdateStatus(*Deployment) (*Deployment, error)
	Delete(name string) error
	//DeleteCollection(options *v1.DeleteOptions, listOptions v1.ListOptions) error
	Get(name string) (*Deployment, error)
	//List(opts v1.ListOptions) (*DeploymentList, error)
	List() (*DeploymentList, error)
	//Patch(name string, pt api.PatchType, data []byte, subresources ...string) (result *v1beta1.Deployment, err error)
}

// NamespaceCli Interface has methods to work with Namespace resources.
type NamespaceCli interface {
	Create(*Namespace) (*Namespace, error)
	Update(*Namespace) (*Namespace, error)
	UpdateStatus(*Namespace) (*Namespace, error)
	Delete(name string) error
	//DeleteCollection(options *v1.DeleteOptions, listOptions v1.ListOptions) error
	Get(name string) (*Namespace, error)
	List() (*NamespaceList, error)
	//Patch(name string, pt api.PatchType, data []byte, subresources ...string) (result *v1.Namespace, err error)
}

// ServiceCli interface has methods to work with Service resources in k8s-assist.
type ServiceCli interface {
	Create(*Service) (*Service, error)
	Update(*Service) (*Service, error)
	UpdateStatus(*Service) (*Service, error)
	Delete(name string) error
	//DeleteCollection(options *v1.DeleteOptions, listOptions v1.ListOptions) error
	Get(name string) (*Service, error)
	List() (*ServiceList, error)
	//Patch(name string, pt api.PatchType, data []byte, subresources ...string) (result *v1.Service, err error)
}

// The ScaleCli interface has methods on Scale resources in k8s-assist.
type ScaleCli interface {
	Get(kind string, name string) (*Scale, error)
	Update(kind string, scale *Scale) (*Scale, error)
}
