import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-votacion',
  templateUrl: './modal-votacion.component.html',
  styleUrls: ['./modal-votacion.component.scss']
})
export class ModalVotacionComponent implements OnInit {
  emailVote = "";
  emailValidado = false;
  existeEmail = false;
  message = "";
  nuevoIndice = 0;
  videoId: number | undefined;
  userName = "";
  videoURL="";
  videoBLOB:any | undefined;
  constructor(
    private db: AngularFireDatabase,
    private dialogRef: MatDialogRef<ModalVotacionComponent>,
    private storage: AngularFireStorage,

  ) { }

  ngOnInit(): void {
    console.log("VideoURL", this.videoURL)
    this.videoBLOB = (this.storage.refFromURL("gs://grillkids-smp.appspot.com/contest/" + this.videoURL)).getDownloadURL()
  }

  validarEmail(emailToVote: string) {
    this.existeEmail = false;
    this.emailValidado = false;
    this.db.database.ref('email-list').once('value').then(
      snapshot => {
        let arrEmails: Array<string> = snapshot.val()
        this.nuevoIndice = arrEmails.length
        let idx = 0
        if (emailToVote.includes('@')) {
          arrEmails.forEach(
            cadaEmail => {
              if (cadaEmail == emailToVote) {
                this.existeEmail = true;
                this.message = "Este email ya se uso para votar"
              } else if (idx == (arrEmails.length - 1) && !this.existeEmail) {
                this.message = "";
                this.emailValidado = true;
              }
              idx++;
            })
        } else {
          this.message = "Por favor ingrese un email valido";
        }
      })
  }

  procesarVotacion(emailToVote: string) {
    this.db.database.ref('email-list/' + this.nuevoIndice).set(emailToVote);
    let numeroVotos = 0
    this.db.database.ref('log-entries/' + this.videoId + '/votesCount').once('value').then(
      snapshot => {
        numeroVotos = snapshot.val();
        numeroVotos++;
        this.db.database.ref('log-entries/' + this.videoId + '/votesCount').set(numeroVotos)
        this.dialogRef.close();
      }
    )

  }
}
