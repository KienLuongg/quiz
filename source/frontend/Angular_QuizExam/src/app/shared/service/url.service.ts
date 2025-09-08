import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UrlService {
  constructor() { }

  subjectImageUrl: string = 'https://quizexam-production.up.railway.app/uploads/img-subject/';

  questionImageUrl: string = 'https://quizexam-production.up.railway.app/uploads/img-question/';

  subjectDefaultImageUrl: string = 'https://quizexam-production.up.railway.app/uploads/img-subject/default.png';
  
  getPageUrl(pageType: 'ADMIN' | 'STUDENT'): string {
    return pageType === 'ADMIN' ? '/admin' : '';
  }

  getSubjectUrl(pageType: 'ADMIN' | 'STUDENT'): string {
    return pageType === 'ADMIN' ? `/admin/subject` : '';
  }

  getChapterUrl(pageType: 'ADMIN' | 'STUDENT', subjectId?: number): string {
    return pageType === 'ADMIN' ? `${this.getSubjectUrl('ADMIN')}/${subjectId}` : '';
  }

  getQuestionUrl(pageType: 'ADMIN' | 'STUDENT', subjectId?: number): string {
    return pageType === 'ADMIN' ? `${this.getSubjectUrl('ADMIN')}/${subjectId}/question-list` : '';
  }

  getAddQuestionUrl(pageType: 'ADMIN' | 'STUDENT', subjectId?: number): string {
    return pageType === 'ADMIN' ? `${this.getSubjectUrl('ADMIN')}/${subjectId}/add-new-question` : '';
  }

  getEditQuestionUrl(pageType: 'ADMIN' | 'STUDENT', subjectId?: number, id?: number): string {
    return pageType === 'ADMIN' ? `${this.getSubjectUrl('ADMIN')}/${subjectId}/edit-question/${id}` : '';
  }

  getClassUrl(pageType: 'ADMIN' | 'STUDENT'): string {
    return pageType === 'ADMIN' ? '/admin/class' : '';
  }

  getClassDetailUrl(pageType: 'ADMIN' | 'STUDENT', classId?: number): string {
    return pageType === 'ADMIN' ? `${this.getClassUrl('ADMIN')}/${classId}` : '';
  }

  getStudentListUrl(pageType: 'ADMIN' | 'STUDENT'): string {
    return pageType === 'ADMIN' ? `/admin/student` : '';
  }

  getMarkUrl(pageType: 'ADMIN' | 'STUDENT', studentId?: number, classId?: number): string {
    return pageType === 'ADMIN' ? `/admin/${classId ? `class/${classId}` : 'student'}/marks/${studentId}` : '/marks';
  }

  getExamUrl(pageType: 'ADMIN' | 'STUDENT'): string {
    return pageType === 'ADMIN' ? `/admin/exam` : '/exam';
  }

  getCreateExamUrl(pageType: 'ADMIN' | 'STUDENT'): string {
    return pageType === 'ADMIN' ? `/admin/exam/create-exam` : '';
  }

  getAddStudentForExamUrl(pageType: 'ADMIN' | 'STUDENT', examId: number): string {
    return pageType === 'ADMIN' ? `/admin/exam/add-student/${examId}` : '';
  }

  getExamDetailUrl(pageType: 'ADMIN' | 'STUDENT', examId: number): string {
    return pageType === 'ADMIN' ? `/admin/exam/detail/${examId}` : `/exam/detail/${examId}`;
  }

  getEditExamInfoUrl(pageType: 'ADMIN' | 'STUDENT', examId: number): string {
    return pageType === 'ADMIN' ? `/admin/exam/edit-exam/${examId}` : '';
  }

  getUpdateExamQuestionsUrl(pageType: 'ADMIN' | 'STUDENT', examId: number): string {
    return pageType === 'ADMIN' ? `/admin/exam/update-questions/${examId}` : '';
  }

  getLevelUrl(pageType: 'ADMIN' | 'STUDENT'): string {
    return pageType === 'ADMIN' ? `/admin/level` : '';
  }

  getAuthorizeUrl(pageType: 'ADMIN' | 'STUDENT'): string {
    return pageType === 'ADMIN' ? `/admin/authorize` : '';
  }

  getAuthorizeDetailUrl(pageType: 'ADMIN' | 'STUDENT'): string {
    return pageType === 'ADMIN' ? `/admin/authorize/detail` : '';
  }

  getExamResultsUrl(pageType: 'ADMIN' | 'STUDENT', examId: number): string {
    return pageType === 'ADMIN' ? `/admin/exam-results/${examId}` : `/exam/result/${examId}`;
  }
}
