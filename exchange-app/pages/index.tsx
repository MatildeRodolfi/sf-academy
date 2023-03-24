import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import { useState, useEffect, Ref } from 'react'
import React, { Component }  from 'react'
import type{ListResponse} from "../openAPI/index"
import {UserApi, TransactionApi} from "../openAPI/index"

let usersApi:UserApi = new UserApi
let transactionApi:TransactionApi = new TransactionApi

type sortType = {
  type:string, 
  ascending:boolean
}

/** Type with all possible filters in transaction*/
type filterType = {
  from:string|undefined, 
  to:string|undefined, 
  valueMin:number|undefined,
  valueMax:number|undefined, 
  dateMin:string|undefined,
  dateMax:string|undefined, 
  rateMin:number|undefined, 
  rateMax:number|undefined
}



/*--------------------------------
----------------------------------
              SYMBOLS
----------------------------------
---------------------------------*/

function X(){
  return(
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
    </svg>
  )
}

function CaretDown(props:{class: string}){
  return(
    <svg className={props.class} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
    </svg>
  )
}

function CaretUp(props:{class: string}){
  return(
    <svg className={props.class} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
    </svg>
  )
}


/*--------------------------------
----------------------------------
              ERROR
----------------------------------
---------------------------------*/

/** ERROR VISUALIZATION*/
function ErrorInCard(props:{error: string}) {
  if (props.error==""){
    return null
  }
  else{
    return <span className={styles.error}>{props.error}</span>
  }
}


/*--------------------------------
----------------------------------
            LOGIN & SIGNUP
----------------------------------
---------------------------------*/

/** LOGIN CARD */
function Login (props: {visible:boolean, close:Function, logged:Function, goSignup:Function}) {
  let [error, setError] = useState("")

  function login(e: React.SyntheticEvent){
    e.preventDefault()

    const target = e.target as typeof e.target & {
      email: { value: string }
      password: { value: string }
    }

    const mail:string = target.email.value
    if (!mail){
      setError("email reaquired")
      return
    }

    const password:string = target.password.value
    if (!password){
      setError("password required")
      return
    }
      
    setError("")

    usersApi.login({email: mail, password: password})
    .then((res:any) => {
      props.logged(mail, res.data.token, res.data.maxAge)
    })
    .catch((error:any)=>{
      setError(error.response.data.details)
    })
  }

  function closeCard(){
    setError("")
    props.close()
  }

  function signup(){
    setError("")
    props.goSignup()
  }

  if (props.visible){
    return (
      <div className={styles.cardDiv}>
        <p className={styles.bigCenterElement}>Login</p>

        <div className={styles.closeDiv} onClick={closeCard}>
          <X/>
        </div>

        <div className={styles.formDiv} >
          <form onSubmit={login}>
            <div className={styles.inputDiv}>
              <input name="email" type="email" placeholder="Your email"></input>
            </div>
            
            <div className={styles.inputDiv}>
              <input name="password" type="password" placeholder="Password"></input>
            </div>

            <ErrorInCard error={error}/>

            <button type="submit" className={[styles.formButton, styles.bigCenterElement].join(" ")}>Login</button>
          </form>
        </div>

        <div className={styles.linkDiv}>
          <button type="button" className={[styles.trasparentButton, styles.bigCenterElement].join(" ")} onClick={signup}>
            <span>
              Don't have an account?
              <span className={styles.coloredText}>Sign up</span>
            </span>
          </button>
        </div>
      </div>
    )
  }
  else{
    return <></>
  }
}

/** SIGNUP CARD */
function Signup (props:{visible:boolean, close:Function, logged:Function, goLogin:Function}){
  let [error, setError] = useState("")

  function signup(e: React.SyntheticEvent){
    e.preventDefault()

    const target = e.target as typeof e.target & {
      email: { value: string }
      password: { value: string }
      password2: { value: string }
      name: { value: string }
      iban: { value: string }
    }

    const mail:string = target.email.value
    if (!mail){
      setError("email reaquired")
      return
    }

    const password:string = target.password.value
    if (!password){
      setError("password required")
      return
    }

    const password2:string = target.password2.value
    if (password!=password2){
      setError("Passwords do not match")
      return
    }

    const name:string = target.name.value
    if (!name){
      setError("name required")
      return
    }

    const iban:string = target.iban.value
    if (!iban){
      setError("iban required")
      return
    }

    setError("")

    usersApi.signup({ email: mail, password: password, name: name, iban: iban})
    .then((res:any) => {
      props.logged(mail, res.data.token, res.data.maxAge)
    })
    .catch((error:any)=>{
      setError(error.response.data.details)
    })
  }

  function closeCard(){
    setError("")
    props.close()
  }

  function login(){
    setError("")
    props.goLogin()
  }

  if (props.visible){
    return (
      <div className={styles.cardDiv}>
        <p className={styles.bigCenterElement}>Login</p>

        <div className={styles.closeDiv} onClick={closeCard}>
          <X/>
        </div>

        <div className={styles.formDiv} >
          <form onSubmit={signup}>
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

            <ErrorInCard error={error}/>

            <button type="submit" className={[styles.formButton, styles.bigCenterElement].join(" ")}>Login</button>
          </form>
        </div>

        <div className={styles.linkDiv}>
          <button type="button" className={[styles.trasparentButton, styles.bigCenterElement].join(" ")} onClick={login}>
            <span>
              Don't have an account? 
              <span className={styles.coloredText}>Sign up</span>
            </span>
          </button>
        </div>
      </div>
    )
  }
  else{
    return <></>
  }
}


/*--------------------------------
----------------------------------
          ACTIONS IN COUNTS
----------------------------------
---------------------------------*/

/** DEPOSIT CARD - deposit on the count of choice*/
function DepositCard (props: {visible:boolean, email:string, token:string, close:Function}) {
  let [error, setError] = useState("")

  function save(e: React.SyntheticEvent){
    e.preventDefault()

    const target = e.target as typeof e.target & {
      quantity: { value: number }
      to: { value: string }
    }

    let value:number = target.quantity.value
    let to:string = target.to.value

    if (!value || value<=0){
      setError("quantity error")
      return
    }
   
    setError("")

    transactionApi.deposit({
      email: props.email,
      value: value.toString(),
      symbol: to, 
      token: props.token
    })
    .then(() => {
      props.close()
    })
    .catch((error:any) => {
      setError(error.response.data.details)
    })
  }

  function closeCard(){
    setError("")
    props.close()
  }

  if (props.visible){
    return (
      <div className={styles.cardDiv}>

        <div className={styles.closeDiv} onClick={closeCard}>
          <X/>
        </div>

        <h3 className={styles.bigCenterElement}>Deposit</h3>
        
        <div className={styles.formDiv} >
          <form onSubmit={save}>
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

            <ErrorInCard error={error}/>

            <button type="submit" className={[styles.formButton, styles.bigCenterElement].join(" ")}>Go</button>
          </form>
        </div>
      </div>
    )
  }
  else{
    return <></>
  }
}

/** BUY CARD - buy a currency of choice*/
function BuyCard (props:{visible:boolean, email:string, token:string, close:Function}) {
  let [error, setError] = useState("")

  function save(e: React.SyntheticEvent){
    e.preventDefault()

    const target = e.target as typeof e.target & {
      quantity: { value: number }
      to: { value: string }
    }
  
    let value:number = target.quantity.value
    let to:string  = target.to.value
    
    if (!value || value<=0){
      setError("quantity error")
    }
    
    setError("")

    transactionApi.buy({
      email: props.email,
      value: value.toString(),
      symbol: to, 
      token: props.token
    })
    .then((r) => {
      props.close()
    })
    .catch((error:any) => {
      setError(error.response.data.details)
    })
  }

  function closeCard(){
    setError("")
    props.close()
  }

  if (props.visible){
    return (
      <div className={styles.cardDiv}>

        <div className={styles.closeDiv} onClick={closeCard}>
          <X/>
        </div>

        <h3 className={styles.bigCenterElement}>Buy</h3>
        
        <div className={styles.formDiv} >
          <form onSubmit={save}>
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

            <ErrorInCard error={error}/>

            <button type="submit" className={[styles.formButton, styles.bigCenterElement].join(" ")}>Go</button>
          </form>
        </div>
      </div>
    )
  }
  else{
    return <></>
  }
}

/** WITHDRAW CARD - Withdraw from the count of choice*/
function WithdrawCard (props:{visible:boolean, email:string, token:string, close:Function}) {
  let [error, setError] = useState("")

  function save(e: React.SyntheticEvent){
    e.preventDefault()

    const target = e.target as typeof e.target & {
      quantity: { value: number }
      to: { value: string }
    }

    let value:number = target.quantity.value
    let to:string = target.to.value
    
    if (!value || value<=0){
      setError("quantity error")
    }

    setError("")

    transactionApi.withdraw({
      email: props.email,
      value: value.toString(),
      symbol: to, 
      token: props.token
    })
    .then(() => {
      props.close()
    })
    .catch((error:any) => {
      setError(error.response.data.details)
    })
  }

  function closeCard(){
    setError("")
    props.close()
  }

  if (props.visible){
    return (
      <div className={styles.cardDiv}>

        <div className={styles.closeDiv} onClick={closeCard}>
          <X/>
        </div>

        <h3 className={styles.bigCenterElement}>Withdraw</h3>
        
        <div className={styles.formDiv} >
          <form onSubmit={save}>
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

            <ErrorInCard error={error}/>

            <button type="submit" className={[styles.formButton, styles.bigCenterElement].join(" ")}>Go</button>
          </form>
        </div>
      </div>
    )
  }
  else{
    return <></>
  }
}


/*--------------------------------
----------------------------------
              FILTERS
----------------------------------
---------------------------------*/

/** Button for visualizing the filter card */
function FilterButton (props:{onClick:React.MouseEventHandler<HTMLButtonElement>}){
  return(
    <button className={[styles.trasparentButton, styles.filterDiv].join(" ")} onClick={props.onClick}>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
        <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z"/>
      </svg>
    </button>
  )
}

/** FILTER CARD */
function FilterCard (props:{visible:boolean, filters:filterType, close:Function, updateFunction:(filters:filterType)=>void}) {
  let [error, setError] = useState("")

  function update(e: React.SyntheticEvent){
    e.preventDefault()

    const target = e.target as typeof e.target & {
      from: { value: string }, 
      to: { value: string },
      valueMin: { value: number }, 
      valueMax: { value: number }, 
      dateMin: { value: string }, 
      dateMax: { value: string }, 
      rateMin: { value: number }, 
      rateMax: { value: number }
    }

    let filters: filterType = {from:undefined, to:undefined, valueMax:undefined, valueMin:undefined, dateMax:undefined, dateMin:undefined, rateMax:undefined, rateMin:undefined}

    filters.from = target.from.value
    if (filters.from==="all"){
      filters.from=undefined
    }

    filters.to = target.to.value
    if (filters.to==="all"){
      filters.to=undefined
    }

    filters.valueMin = target.valueMin.value
    if (!filters.valueMin || filters.valueMin==0){
      filters.valueMin=undefined
    }
    if (filters.valueMin && filters.valueMin<0){
      setError("valueMin < 0")
      return
    }
    
    filters.valueMax = target.valueMax.value
    if (!filters.valueMax || filters.valueMax==0){
      filters.valueMax=undefined
    }
    if (filters.valueMax && filters.valueMax<0){
      setError("valueMax < 0")
      return
    }

    if (filters.valueMin && filters.valueMax && filters.valueMax<filters.valueMin){
      setError("valueMax < valueMin")
      return
    }

    filters.rateMin = target.rateMin.value
    if (!filters.rateMin || filters.rateMin==0){
      filters.rateMin=undefined
    }
    if (filters.rateMin && filters.rateMin<0){
      setError("rateMin < 0")
      return
    }
    
    filters.rateMax = target.rateMax.value
    if (!filters.rateMax || filters.rateMax==0){
      filters.rateMax=undefined
    }
    if (filters.rateMax && filters.rateMax<0){
      setError("rateMax < 0")
      return
    }

    if (filters.rateMin && filters.rateMax && filters.rateMax<filters.rateMin){
      setError("rateMax < rateMin")
      return
    }

    filters.dateMin = target.dateMin.value
    if (!filters.dateMin || filters.dateMin==""){
      filters.dateMin=undefined
    }
    
    filters.dateMax = target.dateMax.value
    if (!filters.dateMax || filters.dateMax==""){
      filters.dateMax=undefined
    }

    if (filters.dateMin && filters.dateMax && filters.dateMax<filters.dateMin){
      setError("dateMax < dateMin")
      return
    }

    setError("")
    props.updateFunction(filters)
    props.close()
  }

  function closeCard(e: React.FormEvent<HTMLDivElement>){
    setError("")
    props.close()
  }

  if (props.visible){
    return (
      <div className={styles.cardDiv}>
        <div className={styles.closeDiv} onClick={closeCard}>
          <X/>
        </div>

        <h3 className={styles.bigCenterElement}>Filter</h3>
        
        <div className={styles.formDiv} >
          <form onSubmit={update}>
            <div className={styles.centerX}>
              <div className={styles.bigCenterElement}>
                  <legend>From: </legend>
                  <select name="from" defaultValue={(!props.filters.from) ? "all" : props.filters.from}>
                    <option value="EUR">EUR </option>
                    <option value="USD">USD</option>
                    <option value="IBAN">IBAN</option>
                    <option value="all">all</option>
                  </select>
              </div>
              <div className={styles.bigCenterElement}>
                  <legend>To: </legend>
                  <select name="to" defaultValue={(!props.filters.to) ? "all" : props.filters.to}>
                    <option value="EUR">EUR </option>
                    <option value="USD">USD</option>
                    <option value="IBAN">IBAN</option>
                    <option value="all">all</option>
                  </select>
              </div>
            </div>

            <div className={styles.centerX}>
              <div className={styles.inputDiv}>
                <input name="valueMin" type="number" step="0.01" placeholder="Value Min" defaultValue={props.filters.valueMin} ></input>
              </div>

              <div className={styles.inputDiv}>
                <input name="valueMax" type="number" step="0.01" placeholder="Value Max" defaultValue={props.filters.valueMax}></input>
              </div>
            </div>
              
            <div className={styles.centerX}>
              <div className={styles.inputDiv}>
                <input name="rateMin" type="number" step="0.01" placeholder="Rate Min" defaultValue={props.filters.rateMin}></input>
              </div>

              <div className={styles.inputDiv}>
                <input name="rateMax" type="number" step="0.01" placeholder="Rate Max" defaultValue={props.filters.rateMax}></input>
              </div>
            </div>

            <div className={styles.centerX}>
              <div className={styles.inputDiv}>
                <input name="dateMin" type="date" placeholder="Date Min" defaultValue={props.filters.dateMin}></input>
              </div>

              <div className={styles.inputDiv}>
                <input name="dateMax" type="date" placeholder="Date Max" defaultValue={props.filters.dateMax}></input>
              </div>
            </div>

            <ErrorInCard error={error}/>

            <button type="submit" className={[styles.formButton, styles.bigCenterElement].join(" ")}>Update</button>
          </form>
        </div>
      </div>
    )
  }
  else{
    return <></>
  }
}


/*--------------------------------
----------------------------------
        TRANSACTIONS TABLE
----------------------------------
---------------------------------*/

/** BASIC TABLE - empty table for transactions */
function BasicTable (props: {children:JSX.Element, changeSort:(sort:sortType)=>void}) {
  let [fromA, setFromA] = useState(false)
  let [fromD, setFromD] = useState(false)
  let [toA, setToA] = useState(false)
  let [toD, setToD] = useState(false)
  let [valueA, setValueA] = useState(false)
  let [valueD, setValueD] = useState(false)
  let [rateA, setRateA] = useState(false)
  let [rateD, setRateD] = useState(false)
  let [dateA, setDateA] = useState(false)
  let [dateD, setDateD] = useState(false)

  function sortByFrom(){
    if (!fromA){
      setFromA(true)
      setFromD(false)
      setToA(false)
      setToD(false)
      setValueA(false)
      setValueD(false)
      setRateA(false)
      setRateD(false)
      setDateA(false)
      setDateD(false)
    }
    else{
      setFromA(false)
      setFromD(true)
      setToA(false)
      setToD(false)
      setValueA(false)
      setValueD(false)
      setRateA(false)
      setRateD(false)
      setDateA(false)
      setDateD(false)
    }
    props.changeSort({type: "from", ascending: fromA})
  }

  function sortByTo(){
    if (!toA){
      setFromA(false)
      setFromD(false)
      setToA(true)
      setToD(false)
      setValueA(false)
      setValueD(false)
      setRateA(false)
      setRateD(false)
      setDateA(false)
      setDateD(false)
    }
    else{
      setFromA(false)
      setFromD(false)
      setToA(false)
      setToD(true)
      setValueA(false)
      setValueD(false)
      setRateA(false)
      setRateD(false)
      setDateA(false)
      setDateD(false)
    }
    props.changeSort({type: "to", ascending: toA})
  }

  function sortByValue(){
    if (!valueA){
      setFromA(false)
      setFromD(false)
      setToA(false)
      setToD(false)
      setValueA(true)
      setValueD(false)
      setRateA(false)
      setRateD(false)
      setDateA(false)
      setDateD(false)
    }
    else{
      setFromA(false)
      setFromD(false)
      setToA(false)
      setToD(false)
      setValueA(false)
      setValueD(true)
      setRateA(false)
      setRateD(false)
      setDateA(false)
      setDateD(false)
    }
    props.changeSort({type: "value", ascending: valueA})
  }

  function sortByRate(){
    if (!rateA){
      setFromA(false)
      setFromD(false)
      setToA(false)
      setToD(false)
      setValueA(false)
      setValueD(false)
      setRateA(true)
      setRateD(false)
      setDateA(false)
      setDateD(false)
    }
    else{
      setFromA(false)
      setFromD(false)
      setToA(false)
      setToD(false)
      setValueA(false)
      setValueD(false)
      setRateA(false)
      setRateD(true)
      setDateA(false)
      setDateD(false)
    }
    props.changeSort({type: "rate", ascending: rateA})
  }

  function sortByDate(){
    if (!dateA){
      setFromA(false)
      setFromD(false)
      setToA(false)
      setToD(false)
      setValueA(false)
      setValueD(false)
      setRateA(false)
      setRateD(false)
      setDateA(true)
      setDateD(false)
    }
    else{
      setFromA(false)
      setFromD(false)
      setToA(false)
      setToD(false)
      setValueA(false)
      setValueD(false)
      setRateA(false)
      setRateD(false)
      setDateA(false)
      setDateD(true)
    }
    props.changeSort({type: "date", ascending: dateA})
  }

  return (
    <table className={styles.transactionTable}>
      <tbody>
        <tr>
          <th>
            <button className={[styles.trasparentButton, styles.tableTitle].join(" ")} onClick={sortByFrom}>
              <span>From</span>
              <div>
                {fromA ? <CaretDown class=""/> : fromD ? <CaretUp class=""/> : <CaretUp class={styles.hidden}/>}
              </div>
            </button>
          </th>
          <th>
            <button className={[styles.trasparentButton, styles.tableTitle].join(" ")} onClick={sortByTo}>
              <span>To</span>
              <div>
                {toA ? <CaretDown class=""/> : toD ? <CaretUp class=""/> : <CaretUp class={styles.hidden}/>}
              </div>
            </button>
          </th>
          <th>
            <button className={[styles.trasparentButton, styles.tableTitle].join(" ")} onClick={sortByValue}>
              <span>Bought Value</span>
              <div>
                {valueA ? <CaretDown class=""/> : valueD ? <CaretUp class=""/> : <CaretUp class={styles.hidden}/>}
              </div>
            </button>
          </th>
          <th>
            <button className={[styles.trasparentButton, styles.tableTitle].join(" ")} onClick={sortByRate}>
              <span>Rate</span>
              <div>
                {rateA ? <CaretDown class=""/> : rateD ? <CaretUp class=""/> : <CaretUp class={styles.hidden}/>}
              </div>
            </button>
          </th>
          <th>
            <button className={[styles.trasparentButton, styles.tableTitle].join(" ")} onClick={sortByDate}>
              <span>Date</span>
              <div>
                {dateA ? <CaretDown class=""/> : dateD ? <CaretUp class=""/> : <CaretUp class={styles.hidden}/>}
              </div>
            </button>
          </th>
        </tr>
        {props.children}
      </tbody> 
    </table>
  )
}

/** TRANSACTION TABLE - dynamic table for transactions */
function TransactionTable(props:{filter:filterType, sort:sortType, email:string, token: string}){
  
  const [lista, setLista] = useState<any>()

  useEffect(() => {
    transactionApi.listTransactions({
      email: props.email,
      from: props.filter.from,
      to: props.filter.to,
      valueMin: (props.filter.valueMin)?props.filter.valueMin.toString():undefined,
      valueMax: (props.filter.valueMax)?props.filter.valueMax.toString():undefined,
      dateMin: props.filter.dateMin,
      dateMax: props.filter.dateMax,
      rateMin: (props.filter.rateMin)?props.filter.rateMin.toString():undefined,
      rateMax: (props.filter.rateMax)?props.filter.rateMax.toString():undefined,
      token: props.token
    })
    .then((res:any) => {
      if (res.data){
        let transactions = JSON.parse(res.data.transactions.toString())
        switch(props.sort.type) {
          case 'from':
            if (!props.sort.ascending) {
              transactions.sort(function(a:ListResponse,b:ListResponse){return a.from > b.from? -1:1})
            }
            else{
              transactions.sort(function(a:ListResponse,b:ListResponse){return a.from < b.from? -1:1})
            }
            break
          case 'to':
            if (!props.sort.ascending) {
              transactions.sort(function(a:ListResponse,b:ListResponse){return a.to > b.to? -1:1})
            }
            else{
              transactions.sort(function(a:ListResponse,b:ListResponse){return a.to < b.to? -1:1})
            }
            break
          case 'value':
            if (!props.sort.ascending) {
              transactions.sort(function(a:ListResponse,b:ListResponse){return +a.value > +b.value? -1:1}
                )
            }
            else{
              transactions.sort(function(a:ListResponse,b:ListResponse){return +a.value < +b.value? -1:1})
            }
            break
          case 'rate':
            if (!props.sort.ascending) {
              transactions.sort(function(a:ListResponse,b:ListResponse){return +a.rate > +b.rate? -1:1})
            }
            else{
              transactions.sort(function(a:ListResponse,b:ListResponse){return +a.rate < +b.rate? -1:1})
            }
            break
          default:
            if (!props.sort.ascending) {
              transactions.sort(function(a:ListResponse,b:ListResponse){return a.date > b.date? -1:1})
            }
            else{
              transactions.sort(function(a:ListResponse,b:ListResponse){return a.date < b.date? -1:1})
            }
            break
        }
        
        setLista(
          transactions.map((data:ListResponse, index:number) =>
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
  }, [props])
  
  return(
    lista
  )
}


/*--------------------------------
----------------------------------
              COUNTS
----------------------------------
---------------------------------*/
/** COUNTS - visualization of counts */
function Counts(props:{update:boolean, email:string, token:string}){
  const [eur, setEur] = useState<number>(0)
  const [usd, setUsd] = useState<number>(0)

  useEffect(() => {
    usersApi.getCounts({
      email: props.email, 
      token: props.token
    })
    .then((res:any) => {
      let eurValue: number = +res.data.eur.toFixed(2)
      setEur(eurValue)
      let usdValue: number = +res.data.usd.toFixed(2)
      setUsd(usdValue)
    })
    .catch(console.error)
  }, [props.update])
  
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


/*--------------------------------
----------------------------------
              HOME
----------------------------------
---------------------------------*/
/** HOME - basic app */
export default function Home() {
  
  const [email, setEmail] = useState<string>("")
  const [token, setToken] = useState<string>("")

  const [filter, setFilter] = useState<filterType>({
    from:undefined, 
    to:undefined,
    valueMin:undefined, 
    valueMax:undefined,
    dateMin:undefined,
    dateMax:undefined, 
    rateMin:undefined, 
    rateMax:undefined
  })
  const [sort, setSort] = useState<sortType>({
    type:"date",
    ascending: true
  })

  const [loginCardVisible, setLoginCardVisible] = useState<boolean>(false)
  const [signupCardVisible, setSignupCardVisible] = useState<boolean>(false)

  const [filterCardVisible, setFilterCardVisible] = useState<boolean>(false)
  const [depositCardVisible, setDepositCardVisible] = useState<boolean>(false)
  const [buyCardVisible, setBuyCardVisible] = useState<boolean>(false)
  const [withdrawCardVisible, setWithdrawCardVisible] = useState<boolean>(false)
  const [updateCounts, setUpdateCounts] = useState<boolean>(false)

  function updateFilter(filters:filterType){
    setFilter(filters)
    setUpdateCounts(!updateCounts)
  }

  function updateSort(sort:sortType){
    setSort(sort)
    setUpdateCounts(!updateCounts)
  }

  function openCardLogin(){
    setLoginCardVisible(true) 
  }

  function openCardSignup(){
    setSignupCardVisible(true) 
  }

  function openCardDeposit(){
    setDepositCardVisible(true) 
  }

  function openCardBuy(){
    setBuyCardVisible(true) 
  }

  function openCardWithdraw(){
    setWithdrawCardVisible(true) 
  }

  function openCardFilter(){
    setFilterCardVisible(true) 
  }

  function closeCardLogin(){
    setLoginCardVisible(false) 
  }

  function closeCardSignup(){
    setSignupCardVisible(false) 
  }

  function closeCardDeposit(){
    setDepositCardVisible(false) 
    updateSort({type:"date", ascending:false})
  }

  function closeCardBuy(){
    setBuyCardVisible(false) 
    updateSort({type:"date", ascending:false})
  }

  function closeCardWithdraw(){
    setWithdrawCardVisible(false) 
    updateSort({type:"date", ascending:false})
  }

  function closeCardFilter(){
    setFilterCardVisible(false) 
    updateSort({type:"date", ascending:false})
  }

  function goLogin(){
    closeCardSignup()
    openCardLogin()
  }

  function goSignup(){
    closeCardLogin()
    openCardSignup()
  }

  function refreshToken(args:[string, string]){
    usersApi.refreshToken({email: args[0], token: args[1]})
    .then((res:any) => {
      loggedIn(args[0], res.data.token, res.data.maxAge)
    })
    .catch((error:any)=>{
      logout()
      console.error(error)
    })
  }

  function loggedIn(email:string, token:string, life:number){
    sessionStorage.setItem('email', email)
    sessionStorage.setItem('token', token)
    setEmail(email)
    setToken(token)
    
    closeCardSignup()
    closeCardLogin()

    setTimeout(refreshToken, life-1000, [email, token])
  }

  function logout(){
    sessionStorage.setItem('email', '')
    sessionStorage.setItem('token', '')
    setEmail('')
    setToken('')
    setDepositCardVisible(false)
    setBuyCardVisible(false)
    setWithdrawCardVisible(false)
    setFilterCardVisible(false)
  }

  useEffect(() => {
    let m = sessionStorage.getItem('email')
    if (m && m!= null && m!=email){
      setEmail(m.toString())
    }
    else{
      setEmail("")
    }

    let t = sessionStorage.getItem('token')
    if (t && t!= null && t!=token){
      setToken(t.toString())
    }
    else{
      setToken("")
    }
  }, [])

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
        {(email && token && email!="" && token!="") ? (
          <div>
            <button onClick={logout}>Logout</button>
          </div>
        ) : (
          <div>
            <button onClick={goSignup}>Sign Up</button>
            <button onClick={goLogin}>Login</button>
            </div>  
        )}
      </div>

      <DepositCard visible={depositCardVisible} email={email} token={token} close={closeCardDeposit}/>
      <BuyCard visible={buyCardVisible} email={email} token={token} close={closeCardBuy}/>
      <WithdrawCard visible={withdrawCardVisible} email={email} token={token} close={closeCardWithdraw}/>
      
      <FilterCard visible={filterCardVisible} filters={filter} close={closeCardFilter} updateFunction={updateFilter}/>

      <Login visible={loginCardVisible} close={closeCardLogin} logged={loggedIn} goSignup={goSignup}/>
      <Signup visible={signupCardVisible} close={closeCardSignup} logged={loggedIn} goLogin={goLogin}/>

      {(email && token && email!="" && token!="") ? (
        <main className={styles.main}>

          <Counts update={updateCounts} email={email} token={token}/>

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
            <TransactionTable filter={filter} sort={sort} email={email} token={token}/>
          </BasicTable>
        </main>
      ): (
        <main className={styles.main}>
        </main>
      )}
    </>
  )
}