import Head from 'next/head'
import styles from '@/styles/u.module.css'
import generalStyles from '@/styles/general.module.css'
import 'isomorphic-fetch'
import { GetStaticProps } from 'next'
import { MouseEventHandler } from 'react'
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react'

export default function u() {
  var CardType: number = 0;
  var client;
  var email: string|null;
  var token: string|null = "tt";

  function onLoad(){
    client = require("../../api/exchangeApi.js")({
      endpoint: "http://localhost:80",
    })

    getTransactions();
  }

  /* --- CARD --- */
  function openCard(id:number){
    CardType = id;
    const cardTypeText = document.getElementById("cardTypeText");
    if (cardTypeText){
      switch(CardType) {
        case 1:
          cardTypeText.innerHTML = 'Deposit to: ';
          break;
        case 2:
          cardTypeText.innerHTML = 'Buy: ';
          break;
        case 3:
          cardTypeText.innerHTML = 'Withdraw from: ';
          break;
      }
    }
    var cardTypeElement = document.getElementById("cardType");
    if (cardTypeElement){
      cardTypeElement.value = "EUR";
    }

    var valueElement = document.getElementById("value");
    if (valueElement){
      valueElement.value = null;
    }
    const cardError = document.getElementById("cardError");
    if (cardError){
      cardError.classList.add(generalStyles.hidden);
    }
    const card = document.getElementById("card");
    if (card){
      card.classList.remove(generalStyles.hidden);
    }
  }

  function saveCard(){
    var cardTypeElement = document.getElementById("cardType");
    var symbol:string|null = null;
    if (cardTypeElement){
      symbol = cardTypeElement.value;
    }

    var valueElement = document.getElementById("value");
    var value:number|null = null;
    if (valueElement){
      value = +valueElement.value;
    }
    if(symbol && value){
      switch(CardType) {
        case 1:
          client.deposit({
            headers:{
              'Access-Control-Allow-Origin': '*'
            },
            body: {
                email: email,
                value: value,
                symbol: symbol, 
                token: token
            }
          })
          .then(res => {
            if (res.status==200){
              const card = document.getElementById("card");
              if (card){
                card.classList.add(generalStyles.hidden);
              }
              update();
            }
            else{
              const cardError = document.getElementById("cardError");
              if (cardError){
                cardError.classList.remove(generalStyles.hidden);
                cardError.innerHTML= "error with saving";
              }
            };
          })
          .catch(() => {
            const cardError = document.getElementById("cardError");
            if (cardError){
              cardError.classList.remove(generalStyles.hidden);
              cardError.innerHTML= "error with saving";
            }
            console.error;
          })
          break;
        case 2:
          client.buy({
            headers:{
              'Access-Control-Allow-Origin': '*'
            },
            body: {
                email: email,
                value: value,
                symbol: symbol, 
                token: token
            }
          })
          .then(res => {
            if (res.status==200){
              const card = document.getElementById("card");
              if (card){
                card.classList.add(generalStyles.hidden);
              }
              update();
            }
            else{
              const cardError = document.getElementById("cardError");
              if (cardError){
                cardError.classList.remove(generalStyles.hidden);
                cardError.innerHTML= "error with saving";
              }
            };
          })
          .catch(() => {
            const cardError = document.getElementById("cardError");
            if (cardError){
              cardError.classList.remove(generalStyles.hidden);
              cardError.innerHTML= "error with saving";
            }
            console.error;
          })
          break;
        case 3:
          client.withdraw({
            headers:{
              'Access-Control-Allow-Origin': '*'
            },
            body: {
                email: email,
                value: value,
                symbol: symbol, 
                token: token
            }
          })
          .then(res => {
            if (res.status==200){
              const card = document.getElementById("card");
              if (card){
                card.classList.add(generalStyles.hidden);
              }
              update();
            }
            else{
              const cardError = document.getElementById("cardError");
              if (cardError){
                cardError.classList.remove(generalStyles.hidden);
                cardError.innerHTML= "error with saving";
              }
            };
          })
          .catch(() => {
            const cardError = document.getElementById("cardError");
            if (cardError){
              cardError.classList.remove(generalStyles.hidden);
              cardError.innerHTML= "error with saving";
            }
            console.error;
          })
          break;
        default:
          console.log("error with card value")
          const cardError = document.getElementById("cardError");
          if (cardError){
            cardError.classList.remove(generalStyles.hidden);
            cardError.innerHTML= "error - close and reopen card";
          }
      }
    }
    else{
      console.log("error with value")
      const cardError = document.getElementById("cardError");
      if (cardError){
        cardError.classList.remove(generalStyles.hidden);
        cardError.innerHTML= "error with quantity";
      }
    }
  }

  function closeCard(){
    const card = document.getElementById("card");
    if (card){
      card.classList.add(generalStyles.hidden);
    }
  }


  /* ---FILTER ---- */
  function openFilter(){
    const filterError = document.getElementById("filterError");
    if (filterError){
      filterError.classList.add(generalStyles.hidden);
    }
    const filter = document.getElementById("filter");
    if (filter){
      filter.classList.remove(generalStyles.hidden);
    }
  }


  function update(){
    var filter = getFilter();
    getTransactions(undefined, undefined, filter.from, filter.to, filter.valueMin, filter.valueMax, filter.dateMin, filter.dateMax, filter.rateMin, filter.rateMax);
    closeFilter();
  }

  function getFilter(){
    var from:string|undefined, 
    to:string|undefined, 
    valueMin:number|undefined, 
    valueMax:number|undefined, 
    dateMin:string|undefined, 
    dateMax:string|undefined, 
    rateMin:number|undefined, 
    rateMax:number|undefined;
    
    const fromFilter = document.getElementById("fromFilter");
    if (fromFilter){
      from = fromFilter.value;
    }
    if (from=="all"){
      from=undefined
    }

    const toFilter = document.getElementById("toFilter");
    if (toFilter){
      to = toFilter.value;
    }
    if (to=="all"){
      to=undefined
    }

    const valueMinElement = document.getElementById("valueMin");
    if (valueMinElement){
      valueMin = valueMinElement.value;
    }
    if (valueMin==0){
      valueMin=undefined
    }
    
    const valueMaxElement = document.getElementById("valueMax");
    if (valueMaxElement){
      valueMax = valueMaxElement.value;
    }
    if (valueMax==0){
      valueMax=undefined
    }

    if (valueMin && valueMax && valueMax<valueMin){
      const filterError = document.getElementById("filterError");
      if (filterError){
        filterError.classList.remove(generalStyles.hidden);
        filterError.innerHTML= "valueMax &#60; valueMin";
      }
    }

    const rateMinElement = document.getElementById("rateMin");
    if (rateMinElement){
      rateMin = rateMinElement.value;
    }
    if (rateMin==0){
      rateMin=undefined
    }
    
    const rateMaxElement = document.getElementById("rateMax");
    if (rateMaxElement){
      rateMax = rateMaxElement.value;
    }
    if (rateMax==0){
      rateMax=undefined
    }

    if (rateMin && rateMax && rateMax<rateMin){
      const filterError = document.getElementById("filterError");
      if (filterError){
        filterError.classList.remove(generalStyles.hidden);
        filterError.innerHTML= "rateMax &#60; rateMin";
      }
    }

    const dateMinElement = document.getElementById("dateMin");
    if (dateMinElement){
      dateMin = dateMinElement.value;
    }
    if (dateMin==""){
      dateMin=undefined
    }
    
    const dateMaxElement = document.getElementById("dateMax");
    if (dateMaxElement){
      dateMax = dateMaxElement.value;
    }
    if (dateMax==""){
      dateMax=undefined
    }

    if (dateMin && dateMax && dateMax<dateMin){
      const filterError = document.getElementById("filterError");
      if (filterError){
        filterError.classList.remove(generalStyles.hidden);
        filterError.innerHTML= "dateMax &#60; dateMin";
      }
    }

    return({
      from: from, 
      to:to, 
      valueMin:valueMin, 
      valueMax:valueMax, 
      dateMin:dateMin, 
      dateMax:dateMax, 
      rateMin:rateMin, 
      rateMax:rateMax
    })
  }

  function closeFilter(){
    const filter = document.getElementById("filter");
    if (filter){
      filter.classList.add(generalStyles.hidden);
    }
  }



  /* ---TRANSACTION --- */
  var fromAscending:boolean = true;
  var toAscending:boolean = true;
  var valueAscending:boolean = true;
  var rateAscending:boolean = true;
  var dateAscending:boolean = true;
  

  function sortByFrom(){
    var filter = getFilter();
    getTransactions('from', fromAscending, filter.from, filter.to, filter.valueMin, filter.valueMax, filter.dateMin, filter.dateMax, filter.rateMin, filter.rateMax);
    const fromA = document.getElementById("fromA");
    const fromD = document.getElementById("fromD");
    if (fromA){
      if (fromD){
        if (fromAscending){
          fromA.classList.remove(generalStyles.hidden);
          fromD.classList.add(generalStyles.hidden);
        }
        else{
          fromD.classList.remove(generalStyles.hidden);
          fromA.classList.add(generalStyles.hidden);
        }
      }
    }
    const toA = document.getElementById("toA");
    if (toA){
      toA.classList.add(generalStyles.hidden);
    }
    const toD = document.getElementById("toD");
    if (toD){
      toD.classList.add(generalStyles.hidden);
    }
    const valueA = document.getElementById("valueA");
    if (valueA){
      valueA.classList.add(generalStyles.hidden);
    }
    const valueD = document.getElementById("valueD");
    if (valueD){
      valueD.classList.add(generalStyles.hidden);
    }
    const rateA = document.getElementById("rateA");
    if (rateA){
      rateA.classList.add(generalStyles.hidden);
    }
    const rateD = document.getElementById("rateD");
    if (rateD){
      rateD.classList.add(generalStyles.hidden);
    }
    const dateA = document.getElementById("dateA");
    if (dateA){
      dateA.classList.add(generalStyles.hidden);
    }
    const dateD = document.getElementById("dateD");
    if (dateD){
      dateD.classList.add(generalStyles.hidden);
    }
    fromAscending = !fromAscending;
    toAscending = true;
    valueAscending = true;
    rateAscending = true;
    dateAscending = true;
  }

  function sortByTo(){
    var filter = getFilter();
    getTransactions('to', toAscending, filter.from, filter.to, filter.valueMin, filter.valueMax, filter.dateMin, filter.dateMax, filter.rateMin, filter.rateMax);
    const fromA = document.getElementById("fromA");
    if (fromA){
      fromA.classList.add(generalStyles.hidden);
    }
    const fromD = document.getElementById("fromD");
    if (fromD){
      fromD.classList.add(generalStyles.hidden);
    }
    const toA = document.getElementById("toA");
    const toD = document.getElementById("toD");
    if (toA){
      if (toD){
        if (toAscending){
          toA.classList.remove(generalStyles.hidden);
          toD.classList.add(generalStyles.hidden);
        }
        else{
          toD.classList.remove(generalStyles.hidden);
          toA.classList.add(generalStyles.hidden);
        }
      }
    }
    const valueA = document.getElementById("valueA");
    if (valueA){
      valueA.classList.add(generalStyles.hidden);
    }
    const valueD = document.getElementById("valueD");
    if (valueD){
      valueD.classList.add(generalStyles.hidden);
    }
    const rateA = document.getElementById("rateA");
    if (rateA){
      rateA.classList.add(generalStyles.hidden);
    }
    const rateD = document.getElementById("rateD");
    if (rateD){
      rateD.classList.add(generalStyles.hidden);
    }
    const dateA = document.getElementById("dateA");
    if (dateA){
      dateA.classList.add(generalStyles.hidden);
    }
    const dateD = document.getElementById("dateD");
    if (dateD){
      dateD.classList.add(generalStyles.hidden);
    }
    fromAscending = true;
    toAscending = !toAscending;
    valueAscending = true;
    rateAscending = true;
    dateAscending = true;
  }

  function sortByValue(){
    var filter = getFilter();
    getTransactions('value', valueAscending, filter.from, filter.to, filter.valueMin, filter.valueMax, filter.dateMin, filter.dateMax, filter.rateMin, filter.rateMax);
    const fromA = document.getElementById("fromA");
    if (fromA){
      fromA.classList.add(generalStyles.hidden);
    }
    const fromD = document.getElementById("fromD");
    if (fromD){
      fromD.classList.add(generalStyles.hidden);
    }
    const toA = document.getElementById("toA");
    if (toA){
      toA.classList.add(generalStyles.hidden);
    }
    const toD = document.getElementById("toD");
    if (toD){
      toD.classList.add(generalStyles.hidden);
    }
    const valueA = document.getElementById("valueA");
    const valueD = document.getElementById("valueD");
    if (valueA){
      if (valueD){
        if (valueAscending){
          valueA.classList.remove(generalStyles.hidden);
          valueD.classList.add(generalStyles.hidden);
        }
        else{
          valueD.classList.remove(generalStyles.hidden);
          valueA.classList.add(generalStyles.hidden);
        }
      }
    }
    const rateA = document.getElementById("rateA");
    if (rateA){
      rateA.classList.add(generalStyles.hidden);
    }
    const rateD = document.getElementById("rateD");
    if (rateD){
      rateD.classList.add(generalStyles.hidden);
    }
    const dateA = document.getElementById("dateA");
    if (dateA){
      dateA.classList.add(generalStyles.hidden);
    }
    const dateD = document.getElementById("dateD");
    if (dateD){
      dateD.classList.add(generalStyles.hidden);
    }
    fromAscending = true;
    toAscending = true;
    valueAscending = !valueAscending;
    rateAscending = true;
    dateAscending = true;
  }

  function sortByRate(){
    var filter = getFilter();
    getTransactions('rate', rateAscending, filter.from, filter.to, filter.valueMin, filter.valueMax, filter.dateMin, filter.dateMax, filter.rateMin, filter.rateMax);
    const fromA = document.getElementById("fromA");
    if (fromA){
      fromA.classList.add(generalStyles.hidden);
    }
    const fromD = document.getElementById("fromD");
    if (fromD){
      fromD.classList.add(generalStyles.hidden);
    }
    const toA = document.getElementById("toA");
    if (toA){
      toA.classList.add(generalStyles.hidden);
    }
    const toD = document.getElementById("toD");
    if (toD){
      toD.classList.add(generalStyles.hidden);
    }
    const valueA = document.getElementById("valueA");
    if (valueA){
      valueA.classList.add(generalStyles.hidden);
    }
    const valueD = document.getElementById("valueD");
    if (valueD){
      valueD.classList.add(generalStyles.hidden);
    }
    const rateA = document.getElementById("rateA");
    const rateD = document.getElementById("rateD");
    if (rateA){
      if (rateD){
        if (rateAscending){
          rateA.classList.remove(generalStyles.hidden);
          rateD.classList.add(generalStyles.hidden);
        }
        else{
          rateD.classList.remove(generalStyles.hidden);
          rateA.classList.add(generalStyles.hidden);
        }
      }
    }
    const dateA = document.getElementById("dateA");
    if (dateA){
      dateA.classList.add(generalStyles.hidden);
    }
    const dateD = document.getElementById("dateD");
    if (dateD){
      dateD.classList.add(generalStyles.hidden);
    }
    fromAscending = true;
    toAscending = true;
    valueAscending = true;
    rateAscending = !rateAscending;
    dateAscending = true;
  }

  function sortByDate(){
    var filter = getFilter();
    getTransactions('date', dateAscending, filter.from, filter.to, filter.valueMin, filter.valueMax, filter.dateMin, filter.dateMax, filter.rateMin, filter.rateMax);
    const fromA = document.getElementById("fromA");
    if (fromA){
      fromA.classList.add(generalStyles.hidden);
    }
    const fromD = document.getElementById("fromD");
    if (fromD){
      fromD.classList.add(generalStyles.hidden);
    }
    const toA = document.getElementById("toA");
    if (toA){
      toA.classList.add(generalStyles.hidden);
    }
    const toD = document.getElementById("toD");
    if (toD){
      toD.classList.add(generalStyles.hidden);
    }
    const valueA = document.getElementById("valueA");
    if (valueA){
      valueA.classList.add(generalStyles.hidden);
    }
    const valueD = document.getElementById("valueD");
    if (valueD){
      valueD.classList.add(generalStyles.hidden);
    }
    const rateA = document.getElementById("rateA");
    if (rateA){
      rateA.classList.add(generalStyles.hidden);
    }
    const rateD = document.getElementById("rateD");
    if (rateD){
      rateD.classList.add(generalStyles.hidden);
    }
    const dateA = document.getElementById("dateA");
    const dateD = document.getElementById("dateD");
    if (dateA){
      if (dateD){
        if (dateAscending){
          dateA.classList.remove(generalStyles.hidden);
          dateD.classList.add(generalStyles.hidden);
        }
        else{
          dateD.classList.remove(generalStyles.hidden);
          dateA.classList.add(generalStyles.hidden);
        }
      }
    }
    fromAscending = true;
    toAscending = true;
    valueAscending = true;
    rateAscending = true;
    dateAscending = !dateAscending;
  }

  function getTransactions(sortBy:string = 'date', ascending:boolean = false, from?:string, to?:string, valueMin?:number, valueMax?:number, dateMin?:string, dateMax?:string, rateMin?:number, rateMax?:number) {
    
    client.listTransactions({
      headers:{
        'Access-Control-Allow-Origin': '*'
      },
      body: {
          email: email,
          from: from,
          to: to,
          valueMin: valueMin,
          valueMax: valueMax,
          dateMin: dateMin,
          dateMax: dateMax,
          rateMin: rateMin,
          rateMax: rateMax,
          token: token
      }
    })
    .then(res => res.json())
    .then(res => {
      console.log(res)
      if (res.data){
        var transactions:JSON[] = JSON.parse(res.data);
        const table = document.getElementById("transactions");
        if (table){
          var title = table.children[0];
          table.innerHTML = '';
          table.appendChild(title);

          switch(sortBy) {
            case 'from':
              if (!ascending) {
                transactions.sort(function(a,b){return a.from > b.from? -1:1;});
              }
              else{
                transactions.sort(function(a,b){return a.from < b.from? -1:1;});
              }
              break;
            case 'to':
              if (!ascending) {
                transactions.sort(function(a,b){return a.to > b.to? -1:1;});
              }
              else{
                transactions.sort(function(a,b){return a.to < b.to? -1:1;});
              }
              break;
            case 'value':
              if (!ascending) {
                transactions.sort(function(a,b){return +a.value > +b.value? -1:1;}
                  );
              }
              else{
                transactions.sort(function(a,b){return +a.value < +b.value? -1:1;});
              }
              break;
            case 'rate':
              if (!ascending) {
                transactions.sort(function(a,b){return +a.rate > +b.rate? -1:1;});
              }
              else{
                transactions.sort(function(a,b){return +a.rate < +b.rate? -1:1;});
              }
              break;
            default:
              if (!ascending) {
                transactions.sort(function(a,b){return a.date > b.date? -1:1;});
              }
              else{
                transactions.sort(function(a,b){return a.date < b.date? -1:1;});
              }
              break;
          }
          
          transactions.map(data=>{
            var date = new Date(data.date).toLocaleString();
            var d = date;

            var value: number = +data.value;
            var rate: number = +data.rate;

            table.insertAdjacentHTML( 'beforeend', 
              "<tr> "
                +"<td>"+data.from+"</td>"
                +"<td>"+data.to+"</td>"
                +"<td>"+value.toFixed(2).toString()+"</td>"
                +"<td>"+rate.toFixed(2).toString()+"</td>"
                +"<td>"+d+"</td>"
              +"</tr>"
            )
          })
        }
      }
      else{
        const table = document.getElementById("transactions");
        if (table){
          var title = table.children[0];
          table.innerHTML = '';
          table.appendChild(title);
        }
      }
    })
    .catch(console.error)
      
    getCounts()
  }


  /* ---COUNTS--- */
  function getCounts() {
    client.getCounts({
      headers:{
        'Access-Control-Allow-Origin': '*'
      },
      body: {
          email: email, 
          token: token
      }
    })
    .then(res => res.json())
    .then(res => {
      const eur = document.getElementById("eur");
      if (eur){
        var eurValue: string = res.eur.toFixed(2).toString();
        eur.innerHTML = eurValue;
      }
      const usd = document.getElementById("usd");
      if (usd){
        var usdValue: string = res.usd.toFixed(2).toString();
        usd.innerHTML = usdValue;
      }
    })
    .catch(console.error)
  }


  function logout(){
    sessionStorage.clear();
    document.location.href = "/";
  }

  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true);
    email = sessionStorage.getItem("email");
    console.log(email);
    token = sessionStorage.getItem("token");
    console.log(token);
    onLoad();
    if (!email && !token){
      document.location.href = "/";
    }
    setData(null)
    setLoading(false)
  }, [])

  if (isLoading) return <p>Loading...</p>
  
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
            <img className={generalStyles.logo} alt="exhange" src="/graph-up.svg" decoding="async" data-nimg="fixed"></img>
        </a>
        <div>
          <button onClick={logout}>Logout</button>
        </div>
      </div>



      <div id="card" className={[generalStyles.cardDiv, generalStyles.hidden].join(" ")}>
        <div className={generalStyles.closeDiv} onClick={closeCard}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
          </svg>
        </div>

        <h3 className={generalStyles.bigCenterElement}>Value</h3>
        
        <div className={generalStyles.formDiv} >
          <form>
            <div className={generalStyles.onLeftX}>
                <legend id="cardTypeText">From: </legend>
                <select id="cardType" defaultValue="EUR">
                  <option value="EUR">EUR </option>
                  <option value="USD">USD</option>
                </select>
            </div>

            <div className={generalStyles.inputDiv}>
              <input id="value" type="number" step="0.01" placeholder="Quantity"></input>
            </div>

            <span id="cardError" className={[generalStyles.error, generalStyles.hidden].join(" ")}>Error</span>

            <button type="button" className={[generalStyles.formButton, generalStyles.bigCenterElement].join(" ")} onClick={saveCard}>Go</button>
          </form>
        </div>
      </div>



      <div id="filter" className={[generalStyles.cardDiv, generalStyles.hidden].join(" ")}>
        <div className={generalStyles.closeDiv} onClick={closeFilter}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
          </svg>
        </div>

        <h3 className={generalStyles.bigCenterElement}>Filter</h3>
        
        <div className={generalStyles.formDiv} >
          <form>
            <div className={generalStyles.centerX}>
              <div className={generalStyles.bigCenterElement}>
                  <legend>From: </legend>
                  <select id="fromFilter" defaultValue="all">
                    <option value="EUR">EUR </option>
                    <option value="USD">USD</option>
                    <option value="IBAN">IBAN</option>
                    <option value="all">all</option>
                  </select>
              </div>
              <div className={generalStyles.bigCenterElement}>
                  <legend>To: </legend>
                  <select id="toFilter" defaultValue="all">
                    <option value="EUR">EUR </option>
                    <option value="USD">USD</option>
                    <option value="IBAN">IBAN</option>
                    <option value="all">all</option>
                  </select>
              </div>
            </div>

            <div className={generalStyles.centerX}>
              <div className={generalStyles.inputDiv}>
                <input id="valueMin" type="number" step="0.01" placeholder="Value Min"></input>
              </div>

              <div className={generalStyles.inputDiv}>
                <input id="valueMax" type="number" step="0.01" placeholder="Value Max"></input>
              </div>
            </div>
              
            <div className={generalStyles.centerX}>
              <div className={generalStyles.inputDiv}>
                <input id="rateMin" type="number" step="0.01" placeholder="Rate Min"></input>
              </div>

              <div className={generalStyles.inputDiv}>
                <input id="rateMax" type="number" step="0.01" placeholder="Rate Max"></input>
              </div>
            </div>

            <div className={generalStyles.centerX}>
              <div className={generalStyles.inputDiv}>
                <input id="dateMin" type="date" placeholder="Date Min"></input>
              </div>

              <div className={generalStyles.inputDiv}>
                <input id="dateMax" type="date" placeholder="Date Max"></input>
              </div>
            </div>

            <span id="filterError" className={[generalStyles.error, generalStyles.hidden].join(" ")}>Error</span>

            <button type="button" className={[generalStyles.formButton, generalStyles.bigCenterElement].join(" ")} onClick={update}>Update</button>
          </form>
        </div>
      </div>



      <main className={generalStyles.main}>
        <div className={[generalStyles.centerX, styles.countsDiv].join(" ")}>
          <div className={generalStyles.centerY}>
            <h2 className={generalStyles.bigCenterElement}>My euro wallet</h2>
            <div className={generalStyles.bigCenterElement}>
              <span id="eur" className={styles.count}></span>
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4 9.42h1.063C5.4 12.323 7.317 14 10.34 14c.622 0 1.167-.068 1.659-.185v-1.3c-.484.119-1.045.17-1.659.17-2.1 0-3.455-1.198-3.775-3.264h4.017v-.928H6.497v-.936c0-.11 0-.219.008-.329h4.078v-.927H6.618c.388-1.898 1.719-2.985 3.723-2.985.614 0 1.175.05 1.659.177V2.194A6.617 6.617 0 0 0 10.341 2c-2.928 0-4.82 1.569-5.244 4.3H4v.928h1.01v1.265H4v.928z"/>
              </svg>
            </div>
          </div>
          <div className={generalStyles.centerY}>
            <h2 className={generalStyles.bigCenterElement}>My dollar wallet</h2>
            <div className={generalStyles.bigCenterElement}>
              <span id="usd" className={styles.count}></span>
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z"/>
              </svg>
            </div>
          </div>
        </div>



        <div className={generalStyles.centerX}>
          <button onClick={()=>openCard(1)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
            </svg>
            <span className={styles.marginLeft}>Deposit</span>
          </button>
          <button onClick={()=>openCard(2)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5zm14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5z"/>
            </svg>
            <span className={styles.marginLeft}>Buy</span>
          </button>
          <button onClick={()=>openCard(3)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
              <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
            </svg>
            <span className={styles.marginLeft}>Withdraw</span>
          </button>
        </div>



        <button className={[generalStyles.trasparentButton, styles.filterDiv].join(" ")} onClick={openFilter}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z"/>
          </svg>
        </button>
        <table id="transactions" className={styles.transactionTable}>
          <tbody>
            <tr>
              <th>
                <button className={[generalStyles.trasparentButton, styles.tableTitle].join(" ")} onClick={sortByFrom}>
                  <span>From</span>
                  <div>
                    <svg id="fromA" className={generalStyles.hidden} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                    <svg id="fromD" className={[generalStyles.hidden, generalStyles.overlap].join(" ")} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                    </svg>
                  </div>
                </button>
              </th>
              <th>
                <button className={[generalStyles.trasparentButton, styles.tableTitle].join(" ")} onClick={sortByTo}>
                  <span>To</span>
                  <div>
                    <svg id="toA" className={generalStyles.hidden} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                    <svg id="toD" className={[generalStyles.hidden, generalStyles.overlap].join(" ")} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                    </svg>
                  </div>
                </button>
              </th>
              <th>
                <button className={[generalStyles.trasparentButton, styles.tableTitle].join(" ")} onClick={sortByValue}>
                  <span>Bought Value</span>
                  <div>
                    <svg id="valueA" className={generalStyles.hidden} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                    <svg id="valueD" className={[generalStyles.hidden, generalStyles.overlap].join(" ")} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                    </svg>
                  </div>
                </button>
              </th>
              <th>
                <button className={[generalStyles.trasparentButton, styles.tableTitle].join(" ")} onClick={sortByRate}>
                  <span>Rate</span>
                  <div>
                    <svg id="rateA" className={generalStyles.hidden} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                    <svg id="rateD" className={[generalStyles.hidden, generalStyles.overlap].join(" ")} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                    </svg>
                  </div>
                </button>
              </th>
              <th>
                <button className={[generalStyles.trasparentButton, styles.tableTitle].join(" ")} onClick={sortByDate}>
                  <span>Date</span>
                  <div>
                    <svg id="dateA" className={generalStyles.hidden} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                    <svg id="dateD" className={[generalStyles.hidden, generalStyles.overlap].join(" ")} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                    </svg>
                  </div>
                </button>
              </th>
            </tr>
          </tbody> 
        </table>
      </main>
    </>
  );
}