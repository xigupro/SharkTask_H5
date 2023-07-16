import BaseProxy from './base';

/**
 * 任务
 */

const paths = {
  getTasks: '/tasks',
  getTask: '/tasks/detailForUser',
  getTypes: '/tasks/getTypes',
  getTaskDetail: '/tasks/detailForUser',
  getMyTaskDetail: '/tasks/getDetail',
  grabTask: '/tasks/grab',
  getTaskReviewStep: '/tasks/getReviewStep',
  getTaskReviewField: '/tasks/getReviewField',
  updateTask: '/tasks/update',
  updateStatus: '/tasks/updateStatus',
  addTask: '/tasks/add',
  updateTaskReview: '/tasks/updateReview',
  submitTaskReview: '/tasks/submitReview',
  getReviewTaskDetail: '/tasks/getReviewDetail',
  getUserTasks: '/tasks/getUserTasks',
  getUserPublishedTasks: '/tasks/getUserPublishedTasks',
  getReviewList: '/tasks/getReviewList',
  getReviewDetailForUser: '/tasks/getReviewDetailForUser',
  reviewResolve: '/tasks/reviewResolve',
  reviewReject: '/tasks/reviewReject',
  reviewRemove: '/tasks/reviewRemove',
  userTaskDetail: '/tasks/userTaskDetail',
  updateReviewTimeoutTask: '/tasks/updateReviewTimeoutTask',
  addAppeal: '/tasks/addAppeal',
  updateAppeal: '/tasks/updateAppeal',
  getAppeal: '/tasks/getAppeal',
  removeTask: '/tasks/remove',
};

class TasksManage extends BaseProxy {
  async getTasks(data) {
    const response = await this.submit('post', paths.getTasks, data);
    return response;
  }

  async getTask(data) {
    const response = await this.submit('post', paths.getTask, data);
    return response;
  }

  async getTypes(data) {
    const response = await this.submit('post', paths.getTypes, data);
    return response;
  }

  async getTaskDetail(data) {
    const response = await this.submit('post', paths.getTaskDetail, data);
    return response;
  }

  async getMyTaskDetail(data) {
    const response = await this.submit('post', paths.getMyTaskDetail, data);
    return response;
  }

  async grabTask(data) {
    const response = await this.submit('post', paths.grabTask, data);
    return response;
  }

  async getTaskReviewStep(data) {
    const response = await this.submit('post', paths.getTaskReviewStep, data);
    return response;
  }

  async getTaskReviewField(data) {
    const response = await this.submit('post', paths.getTaskReviewField, data);
    return response;
  }

  async updateTaskReview(data) {
    const response = await this.submit('post', paths.updateTaskReview, data);
    return response;
  }

  async updateTask(data) {
    const response = await this.submit('post', paths.updateTask, data);
    return response;
  }

  async updateStatus(data) {
    const response = await this.submit('post', paths.updateStatus, data);
    return response;
  }

  async addTask(data) {
    const response = await this.submit('post', paths.addTask, data);
    return response;
  }

  async submitTaskReview(data) {
    const response = await this.submit('post', paths.submitTaskReview, data);
    return response;
  }

  async getReviewTaskDetail(data) {
    const response = await this.submit('post', paths.getReviewTaskDetail, data);
    return response;
  }

  async getUserTasks(data) {
    const response = await this.submit('post', paths.getUserTasks, data);
    return response;
  }

  async getUserPublishedTasks(data) {
    const response = await this.submit('post', paths.getUserPublishedTasks, data);
    return response;
  }

  async getReviewList(data) {
    const response = await this.submit('post', paths.getReviewList, data);
    return response;
  }

  async getReviewDetailForUser(data) {
    const response = await this.submit('post', paths.getReviewDetailForUser, data);
    return response;
  }

  async reviewResolve(data) {
    const response = await this.submit('post', paths.reviewResolve, data);
    return response;
  }

  async reviewReject(data) {
    const response = await this.submit('post', paths.reviewReject, data);
    return response;
  }

  async reviewRemove(data) {
    const response = await this.submit('post', paths.reviewRemove, data);
    return response;
  }

  async userTaskDetail(data) {
    const response = await this.submit('post', paths.userTaskDetail, data);
    return response;
  }

  async updateReviewTimeoutTask(data) {
    const response = await this.submit('post', paths.updateReviewTimeoutTask, data);
    return response;
  }

  async getAppeal(data) {
    const response = await this.submit('post', paths.getAppeal, data);
    return response;
  }

  async updateAppeal(data) {
    const response = await this.submit('post', paths.updateAppeal, data);
    return response;
  }

  async addAppeal(data) {
    const response = await this.submit('post', paths.addAppeal, data);
    return response;
  }

  async removeTask(data) {
    const response = await this.submit('post', paths.removeTask, data);
    return response;
  }
}
const TasksManageProxy = new TasksManage();
export default TasksManageProxy;
