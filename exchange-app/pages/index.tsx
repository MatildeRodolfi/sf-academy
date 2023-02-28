import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import 'isomorphic-fetch'
import { useState, useEffect, Ref } from 'react'
import React, { Component }  from 'react';

type transactionResponse = {
  data: {
    from: string;
    to: string;
    value: number;
    rate: number;
    date: string;
  }[]
};

type dataTransactionResponse= JSON & {
  from: string;
  to: string;
  value: number;
  rate: number;
  date: string;
}

type countsResponse={
  eur: number;
  usd: number;
}

type tokenResponse = {
  details: string;
  data: {
    token: string;
  }
};


/*--------------------------------
----------------------------------
              ERROR
----------------------------------
---------------------------------*/

function ErrorInCard(props:{error: string}) {
  if (props.error==""){
    return null;
  }
  else{
    return <span className={[styles.error].join(" ")}>{props.error}</span>;
  }
}


/*--------------------------------
----------------------------------
         SIGNUP & LOGIN CARD
----------------------------------
---------------------------------*/

class LoginDeposit extends React.Component<{visible:boolean, close:Function, logged:Function, goSignup:Function}, any> {
  constructor(props:{visible:boolean, close:Function, logged:Function, goSignup:Function}) {
    super(props);
    this.state = {
      error: ""
    };
  }

  login(e: React.SyntheticEvent){
    e.preventDefault();

    var client = require("../../api/exchangeApi.js")({
      endpoint: "http://localhost:80",
    })

    const target = e.target as typeof e.target & {
      email: { value: string };
      password: { value: string };
    };
    const mail = target.email.value;
    if (!mail){
      this.setState({ error: "email reaquired"});
      return;
    }
    else{
      this.setState({ error: ""});
    }

    const password = target.password.value;
    if (!password){
      this.setState({ error: "password required"});
      return;
    }
    else{
      this.setState({ error: ""});
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
    .then((res:any) => res.json())
    .then((res:tokenResponse) => {
      if (res.details){
        this.setState({ error: res.details});
      }
      else{
        sessionStorage.setItem("email", mail);
        sessionStorage.setItem("token", res.data.token);
        this.props.logged();
      }
    })
    .catch(console.error)
  }

  closeCard(e: React.FormEvent<HTMLDivElement>){
    this.props.close();
  }

  signup(e: React.FormEvent<HTMLButtonElement>){
    this.props.goSignup();
  }

  render() {
    if (this.props.visible){
      return (
        <div className={[styles.cardDiv].join(" ")}>
          <p className={styles.bigCenterElement}>Login</p>

          <div className={styles.closeDiv} onClick={this.closeCard.bind(this)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
            </svg>
          </div>

          <div className={styles.formDiv} >
            <form onSubmit={this.login.bind(this)}>
              <div className={styles.inputDiv}>
                <input name="email" type="email" placeholder="Your email"></input>
              </div>
              
              <div className={styles.inputDiv}>
                <input name="password" type="password" placeholder="Password"></input>
              </div>

              <ErrorInCard error={this.state.error}/>

              <button type="submit" className={[styles.formButton, styles.bigCenterElement].join(" ")}>Login</button>
            </form>
          </div>

          <div className={styles.linkDiv}>
            <button type="button" className={[styles.trasparentButton, styles.bigCenterElement].join(" ")} onClick={this.signup.bind(this)}>
              <span>
                Don't have an account?&nbsp;
                <span className={styles.coloredText}>Sign up</span>
              </span>
            </button>
          </div>
        </div>
      );
    }
    else{
      return;
    }
  }
}

class SignupDeposit extends React.Component<{visible:boolean, close:Function, logged:Function, goLogin:Function}, any> {
  constructor(props:{visible:boolean, close:Function, logged:Function, goLogin:Function}) {
    super(props);
    this.state = {
      error: ""
    };
  }

  signup(e: React.SyntheticEvent){
    e.preventDefault();

    var client = require("../../api/exchangeApi.js")({
      endpoint: "http://localhost:80",
    })

    const target = e.target as typeof e.target & {
      email: { value: string };
      password: { value: string };
      password2: { value: string };
      name: { value: string };
      iban: { value: string };
    };
    const mail = target.email.value;
    if (!mail){
      this.setState({ error: "email reaquired"});
      return;
    }

    const password = target.password.value;
    if (!password){
      this.setState({ error: "password required"});
      return;
    }

    const password2 = target.password2.value;
    if (password!=password2){
      this.setState({ error: "Passwords do not match"});
      return;
    }

    const name = target.name.value;
    if (!name){
      this.setState({ error: "name required"});
      return;
    }

    const iban = target.iban.value;
    if (!iban){
      this.setState({ error: "iban required"});
      return;
    }

    this.setState({ error: ""});

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
    .then((res:any) => res.json())
    .then((res:tokenResponse) => {
      if (res.details){
        this.setState({ error: res.details});
      }
      else{
        sessionStorage.setItem("email", mail);
        sessionStorage.setItem("token", res.data.token);
        this.props.logged();
      }
    })
    .catch(console.error)
  }

  closeCard(e: React.FormEvent<HTMLDivElement>){
    this.props.close();
  }

  login(e: React.FormEvent<HTMLButtonElement>){
    this.props.goLogin();
  }

  render() {
    if (this.props.visible){
      return (
        <div className={[styles.cardDiv].join(" ")}>
          <p className={styles.bigCenterElement}>Login</p>

          <div className={styles.closeDiv} onClick={this.closeCard.bind(this)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
            </svg>
          </div>

          <div className={styles.formDiv} >
            <form onSubmit={this.signup.bind(this)}>
              <div className={styles.inputDiv}>
                <input name="email" type="email" placeholder="Your email"></input>
              </div>

              <div className={styles.inputDiv}>
                <input name="name" type="text" placeholder="Your name"></input>
              </div>

              <div className={styles.inputDiv}>
                <input name="iban" type="text" placeholder="Your IBAN"></input>
              </div>
              
              <div className={styles.inputDiv}>
                <input id="password" type="password" placeholder="Password"></input>
              </div>

              <div className={styles.inputDiv}>
                <input id="password2" type="password" placeholder="Repeat Password"></input>
              </div>

              <ErrorInCard error={this.state.error}/>

              <button type="submit" className={[styles.formButton, styles.bigCenterElement].join(" ")}>Login</button>
            </form>
          </div>

          <div className={styles.linkDiv}>
            <button type="button" className={[styles.trasparentButton, styles.bigCenterElement].join(" ")} onClick={this.login.bind(this)}>
              <span>
                Don't have an account?&nbsp;
                <span className={styles.coloredText}>Sign up</span>
              </span>
            </button>
          </div>
        </div>
      );
    }
    else{
      return;
    }
  }
}


/*--------------------------------
----------------------------------
          COUNTS CARD
----------------------------------
---------------------------------*/

class CardDeposit extends React.Component<{visible:boolean, close:Function}, any> {
  
  constructor(props:{visible:boolean, close:Function}) {
    super(props);
    this.state = {
      error: ""
    };
  }

  save(e: React.SyntheticEvent){
    e.preventDefault();
    var value:number = 0;
    var to:string = "EUR";

    const target = e.target as typeof e.target & {
      quantity: { value: number };
      to: { value: string };
    };
    const quantity = target.quantity.value.toString();
    const toValue = target.to.value;
    to=toValue;
    value=+quantity;
    if (!quantity){
      this.setState({ error: "quantity error"});
    }
    else{
      this.setState({ error: ""});
      
      //make deposit
      var email = sessionStorage.getItem("email");
      var token = sessionStorage.getItem("token");

      var client = require("../../api/exchangeApi.js")({
        endpoint: "http://localhost:80",
      })
      client.deposit({
        headers:{
          'Access-Control-Allow-Origin': '*'
        },
        body: {
            email: email,
            value: value,
            symbol: to, 
            token: token
        }
      })
      .then((res:any) => {
        if (res.status==200){
          this.props.close();
        }
        else{
          this.setState({ error: "error with saving"});
        };
      })
      .catch(() => {
        this.setState({ error: "error with saving"});
        console.error;
      })
    }
  }

  closeCard(e: React.FormEvent<HTMLDivElement>){
    this.props.close();
  }

  render() {
    if (this.props.visible){
      return (
        <div className={[styles.cardDiv].join(" ")}>
  
          <div className={styles.closeDiv} onClick={this.closeCard.bind(this)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
            </svg>
          </div>
  
          <h3 className={styles.bigCenterElement}>Deposit</h3>
          
          <div className={styles.formDiv} >
            <form onSubmit={this.save.bind(this)}>
              <div className={styles.onLeftX}>
                  <label>
                    <span className={styles.description}>Deposit in:</span>
                    <select name="to" defaultValue="EUR">
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                  </label>
              </div>
              <div className={styles.inputDiv}>
                <input name="quantity" type="number" step="0.01" placeholder="Quantity"></input>
              </div>
  
              <ErrorInCard error={this.state.error}/>
  
              <button type="submit" className={[styles.formButton, styles.bigCenterElement].join(" ")}>Go</button>
            </form>
          </div>
        </div>
      );
    }
    else{
      return;
    }
  }
}

class CardBuy extends React.Component<{visible:boolean, close:Function}, any> {
  
  constructor(props:{visible:boolean, close:Function}) {
    super(props);
    this.state = {
      error: ""
    };
  }

  save(e: React.SyntheticEvent){
    e.preventDefault();

    var value:number = 0;
    var to:string = "EUR";
    const target = e.target as typeof e.target & {
      quantity: { value: number };
      to: { value: string };
    };
    const quantity = target.quantity.value.toString();
    const toValue = target.to.value;
    to=toValue;
    value=+quantity;
    if (!quantity){
      this.setState({ error: "quantity error"});
    }
    else{
      this.setState({ error: ""});
      
      //buy
      var email = sessionStorage.getItem("email");
      var token = sessionStorage.getItem("token");

      var client = require("../../api/exchangeApi.js")({
        endpoint: "http://localhost:80",
      })
      client.buy({
        headers:{
          'Access-Control-Allow-Origin': '*'
        },
        body: {
            email: email,
            value: value,
            symbol: to, 
            token: token
        }
      })
      .then((res:any) => {
        if (res.status==200){
          this.props.close();
        }
        else{
          this.setState({ error: "error with saving"});
        };
      })
      .catch(() => {
        this.setState({ error: "error with saving"});
        console.error;
      })
    }
  }

  closeCard(e: React.FormEvent<HTMLDivElement>){
    this.props.close();
  }

  render() {
    if (this.props.visible){
      return (
        <div className={[styles.cardDiv].join(" ")}>
  
          <div className={styles.closeDiv} onClick={this.closeCard.bind(this)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
            </svg>
          </div>
  
          <h3 className={styles.bigCenterElement}>Buy</h3>
          
          <div className={styles.formDiv} >
            <form onSubmit={this.save.bind(this)}>
              <div className={styles.onLeftX}>
                  <label>
                    <span className={styles.description}>Buy:</span>
                    <select name="to" defaultValue="EUR">
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                  </label>
              </div>
              <div className={styles.inputDiv}>
                <input name="quantity" type="number" step="0.01" placeholder="Quantity"></input>
              </div>
  
              <ErrorInCard error={this.state.error}/>
  
              <button type="submit" className={[styles.formButton, styles.bigCenterElement].join(" ")}>Go</button>
            </form>
          </div>
        </div>
      );
    }
    else{
      return;
    }
  }
}

class CardWithdraw extends React.Component<{visible:boolean, close:Function}, any> {
  
  constructor(props:{visible:boolean, close:Function}) {
    super(props);
    this.state = {
      error: ""
    };
  }

  save(e: React.SyntheticEvent){
    e.preventDefault();

    var value:number = 0;
    var to:string = "EUR";
    const target = e.target as typeof e.target & {
      quantity: { value: number };
      to: { value: string };
    };
    const quantity = target.quantity.value.toString();
    const toValue = target.to.value;
    to=toValue;
    value=+quantity;
    if (!quantity){
      this.setState({ error: "quantity error"});
    }
    else{
      this.setState({ error: ""});
      
      //make withdraw
      var email = sessionStorage.getItem("email");
      var token = sessionStorage.getItem("token");

      var client = require("../../api/exchangeApi.js")({
        endpoint: "http://localhost:80",
      })
      client.withdraw({
        headers:{
          'Access-Control-Allow-Origin': '*'
        },
        body: {
            email: email,
            value: value,
            symbol: to, 
            token: token
        }
      })
      .then((res:any) => {
        if (res.status==200){
          this.props.close();
        }
        else{
          this.setState({ error: "error with saving"});
        };
      })
      .catch(() => {
        this.setState({ error: "error with saving"});
        console.error;
      })
    }
  }

  closeCard(e: React.FormEvent<HTMLDivElement>){
    this.props.close();
  }

  render() {
    if (this.props.visible){
      return (
        <div className={[styles.cardDiv].join(" ")}>
  
          <div className={styles.closeDiv} onClick={this.closeCard.bind(this)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
            </svg>
          </div>
  
          <h3 className={styles.bigCenterElement}>Withdraw</h3>
          
          <div className={styles.formDiv} >
            <form onSubmit={this.save.bind(this)}>
              <div className={styles.onLeftX}>
                  <label>
                    <span className={styles.description}>Withdraw from:</span>
                    <select name="to" defaultValue="EUR">
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                  </label>
              </div>
              <div className={styles.inputDiv}>
                <input name="quantity" type="number" step="0.01" placeholder="Quantity"></input>
              </div>
  
              <ErrorInCard error={this.state.error}/>
  
              <button type="submit" className={[styles.formButton, styles.bigCenterElement].join(" ")}>Go</button>
            </form>
          </div>
        </div>
      );
    }
    else{
      return;
    }
  }
}


/*--------------------------------
----------------------------------
              FILTER
----------------------------------
---------------------------------*/

function FilterButton (props:{onClick:React.MouseEventHandler<HTMLButtonElement>}){
  return(
    <button className={[styles.trasparentButton, styles.filterDiv].join(" ")} onClick={props.onClick}>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
        <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z"/>
      </svg>
    </button>
  )
}

type updateFunctionType = (
  from:string|undefined, 
  to:string|undefined, 
  valueMin:number|undefined,
  valueMax:number|undefined, 
  dateMin:string|undefined,
  dateMax:string|undefined, 
  rateMin:number|undefined, 
  rateMax:number|undefined
)=>void;

class CardFilter extends React.Component<{visible:boolean, close:Function, updateFunction:updateFunctionType}, any> {
  
  constructor(props:{visible:boolean, close:Function, updateFunction:updateFunctionType}) {
    super(props);
    this.state = {
      error: "",
    };
  }

  update(e: React.SyntheticEvent){
    e.preventDefault();

    const target = e.target as typeof e.target & {
      from: { value: string }, 
      to: { value: string },
      valueMin: { value: number }, 
      valueMax: { value: number }, 
      dateMin: { value: string }, 
      dateMax: { value: string }, 
      rateMin: { value: number }, 
      rateMax: { value: number }
    };

    var from:string|undefined, 
    to:string|undefined, 
    valueMin:number|undefined, 
    valueMax:number|undefined, 
    dateMin:string|undefined, 
    dateMax:string|undefined, 
    rateMin:number|undefined, 
    rateMax:number|undefined;

    from = target.from.value;
    if (from=="all"){
      from=undefined
    }

    to = target.to.value;
    if (to=="all"){
      to=undefined
    }

    valueMin = +target.valueMin.value;
    if (valueMin==0){
      valueMin=undefined
    }
    
    valueMax = +target.valueMax.value;
    if (valueMax==0){
      valueMax=undefined
    }

    if (valueMin && valueMax && valueMax<valueMin){
      this.setState({ error: "valueMax < valueMin"});
      return;
    }

    rateMin = +target.rateMin.value;
    if (rateMin==0){
      rateMin=undefined
    }
    
    rateMax = +target.rateMax.value;
    if (rateMax==0){
      rateMax=undefined
    }

    if (rateMin && rateMax && rateMax<rateMin){
      this.setState({ error: "rateMax < rateMin"});
      return;
    }

    dateMin = target.dateMin.value;
    if (dateMin==""){
      dateMin=undefined
    }
    
    dateMax = target.dateMax.value;
    if (dateMax==""){
      dateMax=undefined
    }

    if (dateMin && dateMax && dateMax<dateMin){
      this.setState({ error: "dateMax < dateMin"});
      return;
    }

    this.setState({ error: ""});
    this.props.updateFunction(from, to, valueMin, valueMax, dateMin, dateMax, rateMin, rateMax);
    this.props.close();
  }

  closeCard(e: React.FormEvent<HTMLDivElement>){
    this.props.close();
  }

  render() {
    if (this.props.visible){
      return (
        <div className={[styles.cardDiv].join(" ")}>
          <div className={styles.closeDiv} onClick={this.closeCard.bind(this)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
            </svg>
          </div>

          <h3 className={styles.bigCenterElement}>Filter</h3>
          
          <div className={styles.formDiv} >
            <form onSubmit={this.update.bind(this)}>
              <div className={styles.centerX}>
                <div className={styles.bigCenterElement}>
                    <legend>From: </legend>
                    <select name="from" defaultValue="all">
                      <option value="EUR">EUR </option>
                      <option value="USD">USD</option>
                      <option value="IBAN">IBAN</option>
                      <option value="all">all</option>
                    </select>
                </div>
                <div className={styles.bigCenterElement}>
                    <legend>To: </legend>
                    <select name="to" defaultValue="all">
                      <option value="EUR">EUR </option>
                      <option value="USD">USD</option>
                      <option value="IBAN">IBAN</option>
                      <option value="all">all</option>
                    </select>
                </div>
              </div>

              <div className={styles.centerX}>
                <div className={styles.inputDiv}>
                  <input name="valueMin" type="number" step="0.01" placeholder="Value Min"></input>
                </div>

                <div className={styles.inputDiv}>
                  <input name="valueMax" type="number" step="0.01" placeholder="Value Max"></input>
                </div>
              </div>
                
              <div className={styles.centerX}>
                <div className={styles.inputDiv}>
                  <input name="rateMin" type="number" step="0.01" placeholder="Rate Min"></input>
                </div>

                <div className={styles.inputDiv}>
                  <input name="rateMax" type="number" step="0.01" placeholder="Rate Max"></input>
                </div>
              </div>

              <div className={styles.centerX}>
                <div className={styles.inputDiv}>
                  <input name="dateMin" type="date" placeholder="Date Min"></input>
                </div>

                <div className={styles.inputDiv}>
                  <input name="dateMax" type="date" placeholder="Date Max"></input>
                </div>
              </div>

              <ErrorInCard error={this.state.error}/>

              <button type="submit" className={[styles.formButton, styles.bigCenterElement].join(" ")}>Update</button>
            </form>
          </div>
        </div>
      );
    }
    else{
      return;
    }
  }
}


/*--------------------------------
----------------------------------
        TRANSACTIONS TABLE
----------------------------------
---------------------------------*/

class BasicTable extends React.Component<{children:JSX.Element, changeSort:(type:string, ascending:boolean)=>void}, any> {
  fromAscending:boolean = true;
  toAscending:boolean = true;
  valueAscending:boolean = true;
  rateAscending:boolean = true;
  dateAscending:boolean = true;
  
  constructor(props:{children:JSX.Element, changeSort:(type:string, ascending:boolean)=>void}) {
    super(props);
    this.state = {
      fromA:false,
      fromD:false,
      toA:false,
      toD:false,
      valueA:false,
      valueD:false,
      rateA:false,
      rateD:false,
      dateA:false,
      dateD:false
    };
  }

  sortByFrom(){
    this.props.changeSort("from", this.fromAscending);

    if (this.fromAscending){
      this.setState({
        fromA:true,
        fromD:false,
        toA:false,
        toD:false,
        valueA:false,
        valueD:false,
        rateA:false,
        rateD:false,
        dateA:false,
        dateD:false
      })
    }
    else{
      this.setState({
        fromA:false,
        fromD:true,
        toA:false,
        toD:false,
        valueA:false,
        valueD:false,
        rateA:false,
        rateD:false,
        dateA:false,
        dateD:false
      })
    }
    this.fromAscending = !this.fromAscending;
    this.toAscending = true;
    this.valueAscending = true;
    this.rateAscending = true;
    this.dateAscending = true;
  }

  sortByTo(){
    this.props.changeSort("to", this.toAscending);

    if (this.toAscending){
      this.setState({
        fromA:false,
        fromD:false,
        toA:true,
        toD:false,
        valueA:false,
        valueD:false,
        rateA:false,
        rateD:false,
        dateA:false,
        dateD:false
      })
    }
    else{
      this.setState({
        fromA:false,
        fromD:false,
        toA:false,
        toD:true,
        valueA:false,
        valueD:false,
        rateA:false,
        rateD:false,
        dateA:false,
        dateD:false
      })
    }
    this.fromAscending = true;
    this.toAscending = !this.toAscending;
    this.valueAscending = true;
    this.rateAscending = true;
    this.dateAscending = true;
  }

  sortByValue(){
    this.props.changeSort("value", this.valueAscending);

    if (this.valueAscending){
      this.setState({
        fromA:false,
        fromD:false,
        toA:false,
        toD:false,
        valueA:true,
        valueD:false,
        rateA:false,
        rateD:false,
        dateA:false,
        dateD:false
      })
    }
    else{
      this.setState({
        fromA:false,
        fromD:false,
        toA:false,
        toD:false,
        valueA:false,
        valueD:true,
        rateA:false,
        rateD:false,
        dateA:false,
        dateD:false
      })
    }
    this.fromAscending = true;
    this.toAscending = true;
    this.valueAscending = !this.valueAscending;
    this.rateAscending = true;
    this.dateAscending = true;
  }

  sortByRate(){
    this.props.changeSort("rate", this.rateAscending);

    if (this.rateAscending){
      this.setState({
        fromA:false,
        fromD:false,
        toA:false,
        toD:false,
        valueA:false,
        valueD:false,
        rateA:true,
        rateD:false,
        dateA:false,
        dateD:false
      })
    }
    else{
      this.setState({
        fromA:false,
        fromD:false,
        toA:false,
        toD:false,
        valueA:false,
        valueD:false,
        rateA:false,
        rateD:true,
        dateA:false,
        dateD:false
      })
    }
    this.fromAscending = true;
    this.toAscending = true;
    this.valueAscending = true;
    this.rateAscending = !this.rateAscending;
    this.dateAscending = true;
  }

  sortByDate(){
    this.props.changeSort("date", this.dateAscending);

    if (this.dateAscending){
      this.setState({
        fromA:false,
        fromD:false,
        toA:false,
        toD:false,
        valueA:false,
        valueD:false,
        rateA:false,
        rateD:false,
        dateA:true,
        dateD:false
      })
    }
    else{
      this.setState({
        fromA:false,
        fromD:false,
        toA:false,
        toD:false,
        valueA:false,
        valueD:false,
        rateA:false,
        rateD:false,
        dateA:false,
        dateD:true
      })
    }
    this.fromAscending = true;
    this.toAscending = true;
    this.valueAscending = true;
    this.rateAscending = true;
    this.dateAscending = !this.dateAscending;
  }

  render() {
    return (
      <table className={styles.transactionTable}>
        <tbody>
          <tr>
            <th>
              <button className={[styles.trasparentButton, styles.tableTitle].join(" ")} onClick={this.sortByFrom.bind(this)}>
                <span>From</span>
                <div>
                  {this.state.fromA ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                  ) : (
                    <svg className={styles.hidden} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                  )}
                  {this.state.fromD ? (
                    <svg className={[styles.overlap].join(" ")} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                    </svg>
                  ) : (
                    <svg className={[styles.hidden, styles.overlap].join(" ")} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                    </svg>
                  )}
                </div>
              </button>
            </th>
            <th>
              <button className={[styles.trasparentButton, styles.tableTitle].join(" ")} onClick={this.sortByTo.bind(this)}>
                <span>To</span>
                <div>
                  {this.state.toA ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                  ) : (
                    <svg className={styles.hidden} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                  )}
                  {this.state.toD ? (
                    <svg className={[styles.overlap].join(" ")} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                    </svg>
                  ) : (
                    <svg className={[styles.hidden, styles.overlap].join(" ")} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                    </svg>
                  )}
                </div>
              </button>
            </th>
            <th>
              <button className={[styles.trasparentButton, styles.tableTitle].join(" ")} onClick={this.sortByValue.bind(this)}>
                <span>Bought Value</span>
                <div>
                  {this.state.valueA ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                  ) : (
                    <svg className={styles.hidden} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                  )}
                  {this.state.valueD ? (
                    <svg className={[styles.overlap].join(" ")} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                    </svg>
                  ) : (
                    <svg className={[styles.hidden, styles.overlap].join(" ")} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                    </svg>
                  )}
                </div>
              </button>
            </th>
            <th>
              <button className={[styles.trasparentButton, styles.tableTitle].join(" ")} onClick={this.sortByRate.bind(this)}>
                <span>Rate</span>
                <div>
                  {this.state.rateA ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                  ) : (
                    <svg className={styles.hidden} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                  )}
                  {this.state.rateD ? (
                    <svg className={[styles.overlap].join(" ")} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                    </svg>
                  ) : (
                    <svg className={[styles.hidden, styles.overlap].join(" ")} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                    </svg>
                  )}
                </div>
              </button>
            </th>
            <th>
              <button className={[styles.trasparentButton, styles.tableTitle].join(" ")} onClick={this.sortByDate.bind(this)}>
                <span>Date</span>
                <div>
                  {this.state.dateA ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                  ) : (
                    <svg className={styles.hidden} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                  )}
                  {this.state.dateD ? (
                    <svg className={[styles.overlap].join(" ")} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                    </svg>
                  ) : (
                    <svg className={[styles.hidden, styles.overlap].join(" ")} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                    </svg>
                  )}
                </div>
              </button>
            </th>
          </tr>
          {this.props.children}
        </tbody> 
      </table>
    )
  }
}

function TransactionTable(props:{
  filter:{
    from:string|undefined, 
    to:string|undefined, 
    valueMin:number|undefined, 
    valueMax:number|undefined, 
    dateMin:string|undefined, 
    dateMax:string|undefined, 
    rateMin:number|undefined, 
    rateMax:number|undefined
  },
  sort:{
    type:string,
    ascending:boolean
  }})
{
  const [lista, setLista] = useState<any>();

  useEffect(() => {
    var client = require("../../api/exchangeApi.js")({
      endpoint: "http://localhost:80",
    })
    var email = sessionStorage.getItem("email");
    var token = sessionStorage.getItem("token");
    client.listTransactions({
      headers:{
        'Access-Control-Allow-Origin': '*'
      },
      body: {
          email: email,
          from: props.filter.from,
          to: props.filter.to,
          valueMin: props.filter.valueMin,
          valueMax: props.filter.valueMax,
          dateMin: props.filter.dateMin,
          dateMax: props.filter.dateMax,
          rateMin: props.filter.rateMin,
          rateMax: props.filter.rateMax,
          token: token
      }
    })
    .then((res:any) => res.json())
    .then((res:transactionResponse) => {
      if (res.data){
        var transactions:dataTransactionResponse[] = JSON.parse(res.data.toString());
        switch(props.sort.type) {
          case 'from':
            if (!props.sort.ascending) {
              transactions.sort(function(a,b){return a.from > b.from? -1:1;});
            }
            else{
              transactions.sort(function(a,b){return a.from < b.from? -1:1;});
            }
            break;
          case 'to':
            if (!props.sort.ascending) {
              transactions.sort(function(a,b){return a.to > b.to? -1:1;});
            }
            else{
              transactions.sort(function(a,b){return a.to < b.to? -1:1;});
            }
            break;
          case 'value':
            if (!props.sort.ascending) {
              transactions.sort(function(a,b){return +a.value > +b.value? -1:1;}
                );
            }
            else{
              transactions.sort(function(a,b){return +a.value < +b.value? -1:1;});
            }
            break;
          case 'rate':
            if (!props.sort.ascending) {
              transactions.sort(function(a,b){return +a.rate > +b.rate? -1:1;});
            }
            else{
              transactions.sort(function(a,b){return +a.rate < +b.rate? -1:1;});
            }
            break;
          default:
            if (!props.sort.ascending) {
              transactions.sort(function(a,b){return a.date > b.date? -1:1;});
            }
            else{
              transactions.sort(function(a,b){return a.date < b.date? -1:1;});
            }
            break;
        }
        
        setLista(
            transactions.map((data, index) =>
            <tr key={index}> 
              <td>{data.from}</td>
              <td>{data.to}</td>
              <td>{(+data.value).toFixed(2).toString()}</td>
              <td>{(+data.rate).toFixed(4).toString()}</td>
              <td>{new Date(data.date).toLocaleString()}</td>
            </tr>
          )
        ) 
      }
    })
    .catch(console.error)
  }, [props]);
  
  return(
    lista
  )
}


/*--------------------------------
----------------------------------
                COUNTS
----------------------------------
---------------------------------*/

function Counts(props:{update:boolean}){
  const [eur, setEur] = useState<number>(0);
  const [usd, setUsd] = useState<number>(0);

  useEffect(() => {
    
    var client = require("../../api/exchangeApi.js")({
      endpoint: "http://localhost:80",
    })
    var email = sessionStorage.getItem("email");
    var token = sessionStorage.getItem("token");
    client.getCounts({
      headers:{
        'Access-Control-Allow-Origin': '*'
      },
      body: {
          email: email, 
          token: token
      }
    })
    .then((res:any) => res.json())
    .then((res:countsResponse) => {
      var eurValue: number = +res.eur.toFixed(2);
      setEur(eurValue);
      var usdValue: number = +res.usd.toFixed(2);
      setUsd(usdValue);
    })
    .catch(console.error)
  }, [props]);
  
  return(
    <div className={[styles.centerX, styles.countsDiv].join(" ")}>
      <div className={styles.centerY}>
        <h2 className={styles.bigCenterElement}>My euro wallet</h2>
        <div className={styles.bigCenterElement}>
          <span className={styles.count}>{eur}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4 9.42h1.063C5.4 12.323 7.317 14 10.34 14c.622 0 1.167-.068 1.659-.185v-1.3c-.484.119-1.045.17-1.659.17-2.1 0-3.455-1.198-3.775-3.264h4.017v-.928H6.497v-.936c0-.11 0-.219.008-.329h4.078v-.927H6.618c.388-1.898 1.719-2.985 3.723-2.985.614 0 1.175.05 1.659.177V2.194A6.617 6.617 0 0 0 10.341 2c-2.928 0-4.82 1.569-5.244 4.3H4v.928h1.01v1.265H4v.928z"/>
          </svg>
        </div>
      </div>
      <div className={styles.centerY}>
        <h2 className={styles.bigCenterElement}>My dollar wallet</h2>
        <div className={styles.bigCenterElement}>
          <span className={styles.count}>{usd}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z"/>
          </svg>
        </div>
      </div>
    </div>
  )
}


export default function Home() {
  const [filter, setFilter] = useState<{
    from:string|undefined, 
    to:string|undefined,
    valueMin:number|undefined, 
    valueMax:number|undefined,
    dateMin:string|undefined,
    dateMax:string|undefined, 
    rateMin:number|undefined, 
    rateMax:number|undefined
  }>({
    from:undefined, 
    to:undefined,
    valueMin:undefined, 
    valueMax:undefined,
    dateMin:undefined,
    dateMax:undefined, 
    rateMin:undefined, 
    rateMax:undefined
  });
  const [sort, setSort] = useState({
    type:"date",
    ascending: true
  });

  const [loginCardVIsible, setLoginCardVIsible] = useState(false);
  const [signupCardVIsible, setSignupCardVIsible] = useState(false);

  const [filterCardVIsible, setFilterCardVIsible] = useState(false);
  const [depositCardVIsible, setDepositCardVIsible] = useState(false);
  const [buyCardVIsible, setBuyCardVIsible] = useState(false);
  const [withdrawCardVIsible, setWithdrawCardVIsible] = useState(false);
  const [updateCounts, setUpdateCounts] = useState(false);
  const [logged, setLogged] = useState(false);

  function updateFilter(from:string|undefined, to:string|undefined, valueMin:number|undefined, valueMax:number|undefined, dateMin:string|undefined, dateMax:string|undefined, rateMin:number|undefined, rateMax:number|undefined){
    setFilter({from, to, valueMin, valueMax, dateMin, dateMax, rateMin, rateMax});
    setUpdateCounts(!updateCounts);
  }

  function updateSort(type:string, ascending:boolean){
    setSort({type, ascending});
    setUpdateCounts(!updateCounts);
  }

  function openCardLogin(){
    setLoginCardVIsible(true); 
  }

  function openCardSignup(){
    setSignupCardVIsible(true); 
  }

  function openCardDeposit(){
    setDepositCardVIsible(true); 
  }

  function openCardBuy(){
    setBuyCardVIsible(true); 
  }

  function openCardWithdraw(){
    setWithdrawCardVIsible(true); 
  }

  function openCardFilter(){
    setFilterCardVIsible(true); 
  }

  function closeCardLogin(){
    setLoginCardVIsible(false); 
  }

  function closeCardSignup(){
    setSignupCardVIsible(false); 
  }

  function closeCardDeposit(){
    setDepositCardVIsible(false); 
    updateSort("date", false);
  }

  function closeCardBuy(){
    setBuyCardVIsible(false); 
    updateSort("date", false);
  }

  function closeCardWithdraw(){
    setWithdrawCardVIsible(false); 
    updateSort("date", false);
  }

  function closeCardFilter(){
    setFilterCardVIsible(false); 
    updateSort("date", false);
  }

  function goLogin(){
    closeCardSignup();
    openCardLogin();
  }

  function goSignup(){
    closeCardLogin();
    openCardSignup();
  }

  function loggedIn(){
    setLogged(true);
    closeCardSignup();
    closeCardLogin();
  }

  function logout(){
    setLogged(false);
    sessionStorage.clear();
  }


    return (
      <>
        <Head>
          <title>Exchange App</title>
          <meta name="description" content="Generated by create next app" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/graph-up.svg" />
        </Head>

        <div className={styles.navBar}>
          <a href="/">
              <img className={styles.logo} alt="exhange" src="/graph-up.svg" decoding="async" data-nimg="fixed"></img>
          </a>
          {logged ? (
            <div>
              <button onClick={logout}>Logout</button>
            </div>
          ) : (
            <div>
              <button onClick={openCardSignup}>Sign Up</button>
              <button onClick={openCardLogin}>Login</button>
              </div>  
          )}
        </div>

        <CardDeposit visible={depositCardVIsible} close={closeCardDeposit}/>
        <CardBuy visible={buyCardVIsible} close={closeCardBuy}/>
        <CardWithdraw visible={withdrawCardVIsible} close={closeCardWithdraw}/>
        
        <CardFilter visible={filterCardVIsible} close={closeCardFilter} updateFunction={updateFilter}/>

        <LoginDeposit visible={loginCardVIsible} close={closeCardLogin} logged={loggedIn} goSignup={goSignup}/>
        <SignupDeposit visible={signupCardVIsible} close={closeCardSignup} logged={loggedIn} goLogin={goLogin}/>

        {logged ? (
          <main className={styles.main}>

            <Counts update={updateCounts}/>

            <div className={styles.centerX}>
              <button onClick={openCardDeposit}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                </svg>
                <span className={styles.marginLeft}>Deposit</span>
              </button>
              <button onClick={openCardBuy}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5zm14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5z"/>
                </svg>
                <span className={styles.marginLeft}>Buy</span>
              </button>
              <button onClick={openCardWithdraw}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
                </svg>
                <span className={styles.marginLeft}>Withdraw</span>
              </button>
            </div>

            <FilterButton onClick={openCardFilter}/>
            <BasicTable changeSort={updateSort}>
              <TransactionTable filter={filter} sort={sort}/>
            </BasicTable>
          </main>
        ): (
          <main className={styles.main}>
          </main>
        )}
      </>
    );
  
}