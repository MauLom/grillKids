import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';


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
    public auth: AngularFireAuth
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
    this.auth.createUserWithEmailAndPassword(this.cltEmail, password).then((userCredential => {

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
    }))
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
          this.arrImagenes.push(ref.getDownloadURL());
          console.log("URL: ", ref.getDownloadURL())
        })

      })
  }
}
