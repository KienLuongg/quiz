import { Component } from '@angular/core';

@Component({
  selector: 'app-examination',
  templateUrl: './examination.component.html',
})
export class ExaminationComponent {
  step: boolean = false;

  autoGenerateExamSteps: { stepNumber: number, title: string, status: "active" | "disabled" | "complete" }[] = [
    { stepNumber: 1, title: 'Create Exam', status: 'active' },
    { stepNumber: 2, title: 'Check Questions', status: 'disabled' },
    { stepNumber: 3, title: 'Add Student', status: 'disabled' },
    { stepNumber: 4, title: 'Complete', status: 'disabled' },
  ];

  manualQuestionSelectionSteps: { stepNumber: number, title: string, status: "active" | "disabled" | "complete" }[] = [
    { stepNumber: 1, title: 'Create Exam', status: 'active' },
    { stepNumber: 2, title: 'Add Questions', status: 'disabled' },
    { stepNumber: 3, title: 'Add Student', status: 'disabled' },
    { stepNumber: 4, title: 'Complete', status: 'disabled' },
  ];

  constructor() { }

  handleNextStep(steps: { stepNumber: number, status: string }[], currentStepIndex: number) {
    if (currentStepIndex < steps.length - 1) {
      steps[currentStepIndex].status = 'complete';
      steps[currentStepIndex + 1].status = 'active';
    }
  }

  handleBackStep(steps: { stepNumber: number, status: string }[], currentStepIndex: number): void {
    if (currentStepIndex > 0) {
      steps[currentStepIndex].status = 'disabled';
      steps[currentStepIndex - 1].status = 'active';
    }
  }
}