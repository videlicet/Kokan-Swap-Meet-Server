import { Router } from 'express';
import { createProject, deleteProject, getProject, getProjects, updateProject } from '../controllers/projects.js';

const projectsRouter = Router();

projectsRouter.route('/')
    .get(getProjects)
    .post(createProject);

projectsRouter.route('/:id')
    .get(getProject)
    .put(updateProject)
    .delete(deleteProject);

export default projectsRouter;
