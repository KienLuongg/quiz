import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogPopupComponent } from './dialog-popup/dialog-popup.component';
import { WizardStepComponent } from './wizard-step/wizard-step.component';

@NgModule({
  declarations: [
    DialogPopupComponent,
    WizardStepComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    DialogPopupComponent,
    WizardStepComponent
  ]
})
export class SharedModule { }