import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-modal-votacion',
  templateUrl: './modal-votacion.component.html',
  styleUrls: ['./modal-votacion.component.scss']
})
export class ModalVotacionComponent implements OnInit {

  emailVote = "";

  constructor() { }

  ngOnInit(): void {
  }

}
