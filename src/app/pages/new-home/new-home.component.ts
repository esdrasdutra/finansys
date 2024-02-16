import { Component } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-new-home',
  templateUrl: './new-home.component.html',
  styleUrls: ['./new-home.component.sass']
})
export class NewHomeComponent {
  lanc: any;


  constructor(
    private modalService: ModalService,
  ){}



}
