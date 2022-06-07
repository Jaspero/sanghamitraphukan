import {ModuleWithProviders, NgModule} from '@angular/core';
import {AngularFireStorageModule} from '@angular/fire/storage';
import {CommonModule} from '@angular/common';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ReactiveFormsModule} from '@angular/forms';
import {GalleryUploadComponent} from './gallery-upload/gallery-upload.component';
import {ImageUploadComponent} from './image-upload/image-upload.component';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {LoadClickModule} from '@jaspero/ng-helpers';
import {DragAndDropDirective} from '../../directives/drag-and-drop/drag-and-drop.directive';
import {SanitizeUrlPipe} from '../../pipes/sanitize-url/sanitize-url.pipe';

const COMPONENTS = [
  GalleryUploadComponent,
  ImageUploadComponent,
  DragAndDropDirective
];

const PIPES = [SanitizeUrlPipe];

@NgModule({
  declarations: [...COMPONENTS, ...PIPES],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatInputModule,
    DragDropModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,

    AngularFireStorageModule,
    LoadClickModule
  ],
  exports: [...COMPONENTS]
})
export class FileUploadModule {
  static forRoot(): ModuleWithProviders<FileUploadModule> {
    return {
      ngModule: FileUploadModule
    };
  }
}
