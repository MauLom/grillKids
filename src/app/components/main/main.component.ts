import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { MatDialog } from '@angular/material/dialog';
import { ModalValidacionComponent } from '../modal-validacion/modal-validacion.component';
import { ModalVotacionComponent } from '../modal-votacion/modal-votacion.component';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  quiereParticipar: boolean = false;

  cltName: string = '';
  cltEmail: string = '';
  cltPassword: string = '';

  file1: any;
  file2: any;

  idUser: number | undefined;

  user: any;

  arrParticipantes: Array<any> = [];
  arrImagenes: Array<any> = [];
  tabQuestionsIndex: number = 0;
  constructor(
    private storage: AngularFireStorage,
    private db: AngularFireDatabase,
    public auth: AngularFireAuth,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getAllEntries()
  }
  generateRandomNo(min: number, max: number): number {
    return Math.floor((Math.random() * (max - min + 1)) + min);;
  }
  goNextTab() {
    this.tabQuestionsIndex = (this.tabQuestionsIndex + 1);
  }

  /// [Tab Terminos y condiciones]
  readComprobante(event: any) {
    this.file1 = event.target.files[0];

  }
  readParticipacion(event: any) {
    this.file2 = event.target.files[0];
  }
  registerUserAType() {
    let password = "";
    let possibleChars = ['abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?_-'];
    for (let i = 0; i < 8; i++) {
      password += possibleChars[Math.floor(Math.random() * possibleChars.length)];
    }
    this.auth.createUserWithEmailAndPassword(this.cltEmail, password).then(
      (userCredential => {
        ///[Main Auth]
        this.user = firebase.auth().currentUser;
        this.user.updateProfile({ displayName: this.cltName }).then().catch()
        this.user.sendEmailVerification().then().catch()

        ///[RTDB]
        let logId = this.generateRandomNo(1000, 9999)
        this.db.database.ref('log-entries/' + logId).set({
          userId: this.user.uid,
          userName: this.cltName,
          fileContest: logId.toString() + '-' + this.user.uid,
          votesCount: 0
        })

        ///[Storage]
        /*Con barra para tenerlos en carpetas diferentes para ubicacion mas rapida*/
        this.uploadFile(this.file1, this.user.uid, 'comprobante/' + logId.toString() + '-' + this.user.uid)
        /* con guion para poder iterar la misma carpeta*/
        this.uploadFile(this.file2, this.user.uid, logId.toString() + '-' + this.user.uid)
        this.dialog.open(ModalValidacionComponent);
      }),
      (error) => {
        let dialogRef = this.dialog.open(ModalValidacionComponent);
        console.log("error", error)
        if (error.code == "auth/email-already-in-use") {
          dialogRef.componentInstance.message = "Este email ya se encuentra en uso";
        } else {
          dialogRef.componentInstance.message = "Error no identificado, por favor identifica al soporte"
        }
        dialogRef.componentInstance.hasError = true;
      }
    )
      .catch((error) => {
        console.error(error.message);
      })
    this.quiereParticipar = false;
  }
  uploadFile(file: any, uid: string, name: string) {
    const filePath = '/contest/' + name;
    const task = this.storage.upload(filePath, file);
  }
  showForm() {
    this.quiereParticipar = true;
    this.idUser = this.generateRandomNo(0, 9999)
  }
  /// [Tab Vota ya]
  getAllEntries() {
    this.db.database.ref('log-entries').once('value').then(
      snapshot => {
        this.arrParticipantes = Object.entries(snapshot.val())
        this.arrImagenes = [];

        this.arrParticipantes.forEach(item => {
          let ref = this.storage.refFromURL("gs://grillkids-smp.appspot.com/contest/" + item[1].fileContest)
          item.push(ref.getDownloadURL());
          console.log("item arr participantes: ", item);

        })

      })
  }

  clickVotar(data:any) {
    console.log("Data:", data)
    let dialogRef =  this.dialog.open(ModalVotacionComponent);
  }
}
