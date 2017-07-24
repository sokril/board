package service

import (
	"git/inspursoft/board/src/common/dao"
	"git/inspursoft/board/src/common/model"

	"github.com/astaxie/beego/orm"
)

func AddOrUpdateProjectMember(projectID int64, userID int64, roleID int64) (bool, error) {
	projectMember := model.ProjectMember{ProjectID: projectID, UserID: userID, RoleID: roleID}
	_, err := dao.InsertOrUpdateProjectMember(projectMember)
	if err != nil {
		return false, err
	}
	return true, nil
}

func GetProjectMembers(projectID int64) ([]*model.ProjectMember, error) {
	return dao.GetProjectMembers(model.Project{ID: projectID})
}

func DeleteProjectMember(projectID int64, userID int64) (bool, error) {
	projectMember := model.ProjectMember{ID: projectID + userID}
	_, err := dao.DeleteProjectMember(projectMember)
	if err != nil {
		return false, err
	}
	return true, nil
}

func HasProjectAdminRole(projectID int64, userID int64) (bool, error) {
	role, err := dao.GetProjectMemberRole(model.Project{ID: projectID}, model.User{ID: userID})
	if err != nil {
		return false, err
	}
	return (role != nil && role.ID == model.ProjectAdmin), nil
}

func IsProjectMember(projectID int64) (bool, error) {
	members, err := GetProjectMembers(projectID)
	if err != nil {
		return false, err
	}
	return (members != nil && len(members) > 0), nil
}

func GetRoleByID(roleID int64) (*model.Role, error) {
	role, err := dao.GetRole(model.Role{ID: roleID}, "id")
	if err != nil {
		if err == orm.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return role, nil
}