import { env } from '@env';

const API_URL = `${env.app.urlApi}/api/v1`;
const ADMIN_API_URL = `${API_URL}/admin`;
const HR_GAME_API_URL = `${API_URL}/hr-games`;
const GAME_API_URL = `${API_URL}/games`;
const ASSESSMENT_GAME_API_URL = `${API_URL}/assessment-games`;
const LOGICAL_QUESTION_API_URL = `${API_URL}/logical-questions`;
const ASSESSMENT_API_URL = `${API_URL}/assessments`;
const GAME_RESULT_API_URL = `${API_URL}/results`;

// ADMIN - USER
export const CREATE_HR = `${ADMIN_API_URL}/create-hr`;
export const LIST_HRS = `${ADMIN_API_URL}/list-hrs`;
export const USER_INFO = `${ADMIN_API_URL}/user-info/:userId`;
export const UPDATE_PASSWORD = `${API_URL}/user/update-password`;

// HR_GAME
export const CREATE_HR_GAME = `${HR_GAME_API_URL}/create`;
export const GET_GAMES_BY_HR_ID = `${HR_GAME_API_URL}/:hrId`;
export const GET_ALL_HR_GAMES = `${HR_GAME_API_URL}/`;
export const DELETE_HR_GAME = `${HR_GAME_API_URL}/delete/:hrId`;

// GAME
export const CREATE_GAME = `${GAME_API_URL}/create`;
export const GET_ALL_GAMES = `${GAME_API_URL}/`;
export const GET_DETAIL_GAME = `${GAME_API_URL}//:gameId`;

// ASSESSMENT
export const CREATE_ASSESSMENT = `${ASSESSMENT_API_URL}/create`;
export const GET_ASSESSMENTS_BY_HR_ID = `${ASSESSMENT_API_URL}/:hrId`;
export const GET_DETAIL_ASSESSMENT = `${ASSESSMENT_API_URL}/detail/:assessmentId`;
export const DELETE_ASSESSMENT = `${ASSESSMENT_API_URL}/delete/:assessmentId`;
export const INVITE_CANDIDATE = `${ASSESSMENT_API_URL}/invite`;

// ASSESSMENT_GAME
export const ADD_GAME_TO_ASSESSMENT = `${ASSESSMENT_GAME_API_URL}/create`;
export const GET_ALL_GAMES_IN_ASSESSMENT = `${ASSESSMENT_GAME_API_URL}/:assessmentId`;
export const DELETE_ASSESSMENT_GAME = `${ASSESSMENT_GAME_API_URL}/delete/:assessmentId`;

// QUESTION
export const CREATE_LOGICAL_QUESTION = `${LOGICAL_QUESTION_API_URL}/create`;
export const RANDOM_LOGICAL_QUESTIONS = `${LOGICAL_QUESTION_API_URL}/random`;
export const GET_DETAIL_LOGICAL_QUESTION = `${LOGICAL_QUESTION_API_URL}/detail/:questionId`;
export const DELETE_LOGICAL_QUESTION = `${LOGICAL_QUESTION_API_URL}/delete`;

// GAME_RESULT
export const CONTINUE_GAME = `${GAME_RESULT_API_URL}/continue`;
