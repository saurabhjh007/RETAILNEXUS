import api from './api';

export const agileService = {
  getSprints: () => api.get('/agile/sprints'),
  updateSprintProgress: (sprintNumber, status, completedPoints) =>
    api.patch(`/agile/sprints/${sprintNumber}`, null, {
      params: { status, completedPoints }
    }),
};
