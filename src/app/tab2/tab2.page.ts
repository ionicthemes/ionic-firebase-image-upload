import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { DataService } from '../utils/services/data.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements ViewWillEnter {
  loginForm: FormGroup;
  submitError: string;
  submitSuccess: string;

  validation_messages = {
    'email': [
      { type: 'required', message: 'Email is required.' },
      { type: 'pattern', message: 'Enter a valid email.' }
    ],
    'password': [
      { type: 'required', message: 'Password is required.' },
      { type: 'minlength', message: 'Password must be at least 5 characters long.' }
    ]
  };

  constructor(
    public dataService: DataService,
    public router: Router
  ) {
    this.loginForm = new FormGroup({
      'email': new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      'password': new FormControl('', Validators.compose([
        Validators.minLength(5),
        Validators.required
      ]))
    });
  }

  ionViewWillEnter(): void {
    // empty the form success message
    this.submitSuccess = "";
  }

  doSignIn(): void {
    this.submitError = null;
    const email = this.loginForm.value['email'];
    const password = this.loginForm.value['password'];

    this.dataService.signInToFirebase(email, password)
    .then(user => {
      this.submitSuccess = "User signed in successfully.";
      this.router.navigate(['tabs/tab2/private-content']);
    })
    .catch(error => {
      this.submitError = error.message;
    });
  }

  doSignUp(): void {
    this.submitError = null;
    const email = this.loginForm.value['email'];
    const password = this.loginForm.value['password'];

    this.dataService.signUpToFirebase(email, password)
    .then(user => {
      // automatically sign the user in
      this.dataService.signInToFirebase(email, password)
      .then(user => {
        this.router.navigate(['tabs/tab2/private-content']);
      })
    })
    .catch(error => {
      this.submitError = error.message;
    });
  }
}
