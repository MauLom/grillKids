import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-modal-validacion',
  templateUrl: './modal-validacion.component.html',
  styleUrls: ['./modal-validacion.component.scss']
})
export class ModalValidacionComponent implements OnInit {

  hasError:boolean = false;
  message:string ="";

  constructor() { }

  ngOnInit(): void {
  }

}
