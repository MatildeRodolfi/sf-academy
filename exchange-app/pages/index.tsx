import Head from 'next/head'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import generalStyles from '@/styles/general.module.css'
import { isReturnStatement } from 'typescript'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  function openLogin(){
    var emailLogin = document.getElementById("emailLogin");
    if (emailLogin){
      emailLogin.value = null;
    }
    const passwordLogin = document.getElementById("passwordLogin");
    if (passwordLogin){
      passwordLogin.value = null;
    }
    const loginError = document.getElementById("loginError");
    if (loginError){
      loginError.classList.add(generalStyles.hidden);
    }
    const login = document.getElementById("login");
    if (login){
      login.classList.remove(generalStyles.hidden);
    }
  }

  function openSignup(){
    var emailSignup = document.getElementById("mailSignup");
    if (emailSignup){
      emailSignup.value = null;
    }
    const passwordSignup = document.getElementById("passwordSignup");
    if (passwordSignup){
      passwordSignup.value = null;
    }
    const password2 = document.getElementById("password2");
    if (password2){
      password2.value = null;
    }
    const iban = document.getElementById("iban");
    if (iban){
      iban.value = null;
    }
    const nome = document.getElementById("name");
    if (nome){
      nome.value = null;
    }
    const signupError = document.getElementById("signupError");
    if (signupError){
      signupError.classList.add(generalStyles.hidden);
    }
    const signup = document.getElementById("signup");
    if (signup){
      signup.classList.remove(generalStyles.hidden);
    }
  }

  function closeLogin(){
    const login = document.getElementById("login");
    if (login){
      login.classList.add(generalStyles.hidden);
    }
  }

  function closeSignup(){
    const signup = document.getElementById("signup");
    if (signup){
      signup.classList.add(generalStyles.hidden);
    }
  }

  function goLogin(){
    closeSignup();
    openLogin()
  }

  function goSignup(){
    closeLogin();
    openSignup()
  }

  function login(){
    var client = require("../../api/exchangeApi.js")({
      endpoint: "http://localhost:80",
    })
    const emailElement = document.getElementById("emailLogin");
    var mail:string = "";
    if (emailElement){
      mail = emailElement.value;
    }
    if (!mail){
      const loginError = document.getElementById("loginError");
      if (loginError){
        loginError.classList.remove(generalStyles.hidden);
        loginError.innerHTML="mail is required";
      }
      return;
    }
    const passwordLogin = document.getElementById("passwordLogin");
    var password:string = "";
    if (passwordLogin){
      password = passwordLogin.value;
    }
    if (!password){
      const loginError = document.getElementById("loginError");
      if (loginError){
        loginError.classList.remove(generalStyles.hidden);
        loginError.innerHTML="password is required";
      }
      return;
    }
    client.login({
      headers:{
        'Access-Control-Allow-Origin': '*'
      },
      body: {
          email: mail, 
          password: password
      }
    })
    .then(res => res.json())
    .then(res => {
      if (res.details){
        const loginError = document.getElementById("loginError");
        if (loginError){
          loginError.classList.remove(generalStyles.hidden);
          loginError.innerHTML=res.details;
        }
      }
      else{
        sessionStorage.setItem("email", mail);
        sessionStorage.setItem("token", res.data.token);
        document.location.href = "/u";
      }
    })
    .catch(console.error)
  }

  function signup(){
    var client = require("../../api/exchangeApi.js")({
      endpoint: "http://localhost:80",
    })
    const emailElement = document.getElementById("emailSignup");
    var mail:string = "";
    if (emailElement){
      mail = emailElement.value;
    }
    if (!mail){
      const signupError = document.getElementById("signupError");
      if (signupError){
        signupError.classList.remove(generalStyles.hidden);
        signupError.innerHTML="email is required";
      }
      return;
    }
    const passwordLogin = document.getElementById("passwordSignup");
    var password:string = "";
    if (passwordLogin){
      password = passwordLogin.value;
    }
    if (!password){
      const signupError = document.getElementById("signupError");
      if (signupError){
        signupError.classList.remove(generalStyles.hidden);
        signupError.innerHTML="password is required";
      }
      return;
    }
    const password2Element = document.getElementById("password2");
    var password2:string = "";
    if (password2Element){
      password2 = password2Element.value;
    }
    if (password!=password2){
      const signupError = document.getElementById("signupError");
      if (signupError){
        signupError.classList.remove(generalStyles.hidden);
        signupError.innerHTML="Passwords do not match";
      }
      return;
    }
    const nameElement = document.getElementById("name");
    var name:string = "";
    if (nameElement){
      name = nameElement.value;
    }
    if (!name){
      const signupError = document.getElementById("signupError");
      if (signupError){
        signupError.classList.remove(generalStyles.hidden);
        signupError.innerHTML="name is required";
      }
      return;
    }
    const ibanElement = document.getElementById("iban");
    var iban:string = "";
    if (ibanElement){
      iban = ibanElement.value;
    }
    if (!iban){
      const signupError = document.getElementById("signupError");
      if (signupError){
        signupError.classList.remove(generalStyles.hidden);
        signupError.innerHTML="iban is required";
      }
      return;
    }

    client.signup({
      headers:{
        'Access-Control-Allow-Origin': '*'
      },
      body: {
          email: mail, 
          password: password,
          name: name,
          iban: iban
      }
    })
    .then(res => res.json())
    .then(res => {
      if (res.details){
        const loginError = document.getElementById("loginError");
        if (loginError){
          loginError.classList.remove(generalStyles.hidden);
          loginError.innerHTML=res.details;
        }
      }
      else{
        sessionStorage.setItem("email", mail);
        sessionStorage.setItem("token", res.data.token);
        document.location.href = "/u";
      }
    })
    .catch(console.error)
  }

  function visualizePw(n:number){
    var x:HTMLElement|null;
    var yO:HTMLElement|null;
    var yC:HTMLElement|null;
    if (n==3){
      x = document.getElementById("password2");
      yO = document.getElementById("pw2-eyeOpen");
      yC = document.getElementById("pw2-eyeClose");
    }
    else{
      if (n==2){
        x = document.getElementById("passwordSignup");
        yO = document.getElementById("pwSignup-eyeOpen");
        yC = document.getElementById("pwSignup-eyeClose");
      }
      else{
        x = document.getElementById("passwordLogin");
        yO = document.getElementById("pwLogin-eyeOpen");
        yC = document.getElementById("pwLogin-eyeClose");
      }
    }
    if (x && yC && yO){
      console.log("ol");
      if (x.type === "password") {
        x.type = "text";
        yO.classList.remove(generalStyles.hidden);
        yC.classList.add(generalStyles.hidden);
      } else {
        x.type = "password";
        yC.classList.remove(generalStyles.hidden);
        yO.classList.add(generalStyles.hidden);
      }
    }
  }


  return (
    <>
      <Head>
        <title>Exchange App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/graph-up.svg" />
      </Head>

      <div className={generalStyles.navBar}>
        <a href="/">
            <img className={generalStyles.logo} alt="whop" src="/graph-up.svg" decoding="async" data-nimg="fixed"></img>
        </a>
        <div>
          <button onClick={openSignup}>Sign Up</button>
          <button onClick={openLogin}>Login</button>
        </div>
      </div>
      


      <div id="login" className={[generalStyles.cardDiv, generalStyles.hidden].join(" ")}>

        <p className={generalStyles.bigCenterElement}>Login</p>

        <div className={generalStyles.closeDiv} onClick={closeLogin}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
          </svg>
        </div>

        <div className={generalStyles.formDiv} >
          <form>
            <div className={generalStyles.inputDiv}>
              <input id="emailLogin" type="email" placeholder="Your email"></input>
            </div>
            
            <div className={generalStyles.inputDiv}>
              <input id="passwordLogin" type="password" placeholder="Password"></input>
            
              <div>
                <button type="button" className={generalStyles.trasparentButton} onClick={()=>{visualizePw(1)}}>
                  <svg id="pwLogin-eyeOpen" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                  </svg>
                  
                  <svg id="pwLogin-eyeClose" className={generalStyles.overlap} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                    <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                    <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                  </svg>
                </button>
              </div>
            </div>

            <span id="loginError" className={[generalStyles.error, generalStyles.hidden].join(" ")}>Error</span>

            <button type="button" className={[generalStyles.formButton, generalStyles.bigCenterElement].join(" ")} onClick={login}>Login</button>
          </form>
        </div>

        <div className={styles.linkDiv}>
          <button type="button" className={[generalStyles.trasparentButton, styles.bigCenterElement].join(" ")} onClick={goSignup}>
            <span>
              Don't have an account?&nbsp;
              <span className={styles.coloredText}>Sign up</span>
            </span>
          </button>
        </div>
      </div>



      <div id="signup" className={[generalStyles.cardDiv, generalStyles.hidden].join(" ")}>

        <p className={generalStyles.bigCenterElement}>Sign Up</p>

        <div className={generalStyles.closeDiv}  onClick={closeSignup}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
          </svg>
        </div>

        <div className={generalStyles.formDiv}>
          <form>
            <div className={generalStyles.inputDiv}>
              <input id="emailSignup" type="email" name="email" placeholder="Your email"></input>
            </div>

            <div className={generalStyles.inputDiv}>
              <input id="name" type="text" name="name" placeholder="Your name"></input>
            </div>

            <div className={generalStyles.inputDiv}>
              <input id="iban" type="text" name="iban" placeholder="Your IBAN"></input>
            </div>
            
            <div className={generalStyles.inputDiv}>
              <input id="passwordSignup" type="password" placeholder="Password"></input>
            
              <div>
                <button type="button" className={generalStyles.trasparentButton} onClick={()=>{visualizePw(2)}}>
                  <svg id="pwSignup-eyeOpen" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                  </svg>
                  
                  <svg id="pwSignup-eyeClose" className={generalStyles.overlap} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                    <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                    <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className={generalStyles.inputDiv}>
              <input id="password2" type="password" placeholder="Repeat Password"></input>
            
              <div>
                <button type="button" className={generalStyles.trasparentButton} onClick={()=>{visualizePw(3)}}>
                  <svg id="pw2-eyeOpen" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                  </svg>
                  
                  <svg id="pw2-eyeClose" className={generalStyles.overlap} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                    <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                    <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                  </svg>
                </button>
              </div>
            </div>

            <span id="signupError" className={[generalStyles.error, generalStyles.hidden].join(" ")}>Error</span>

            <button type="button" className={[generalStyles.formButton, generalStyles.bigCenterElement].join(" ")} onClick={signup}>Sign Up</button>
          </form>
        </div>

        <div className={styles.linkDiv}>
          <button type="button" className={[generalStyles.trasparentButton, generalStyles.bigCenterElement].join(" ")} onClick={goLogin}>
            <span>
              Already have an account?&nbsp;
              <span className={styles.coloredText}>Login</span>
            </span>
          </button>
        </div>
      </div>

      <main className={generalStyles.main}>
        
      </main>
    </>
  )
}
