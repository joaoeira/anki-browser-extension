const express = require('express');
const fetch = require('node-fetch');
const jsdom = require('jsdom')
const app = express();

const ANKICONNECT = 'http://127.0.0.1:8765';



// fetch(ANKICONNECT,getCurrentCard)
//     .then(res => {
//         res.json().then(data => {
//             console.log([data.question,data.answer])})
//     });

// const getDueCards = async () => {
//     const options = {
//         method: 'POST',
//         body: JSON.stringify({
//             action: 'findCards',
//             params: {query: "is:due"}
//         })
//     }
//     try{
//         const fetchedDeckCards = await fetch(ANKICONNECT,options);
//         const deckCards = await fetchedDeckCards.json();
//         return deckCards;
//     } catch(error){console.error(error);}
// }



// const getCardInfo = async (card) => {
//     const options = {
//         method: 'POST',
//         body: JSON.stringify({
//             action: 'cardsInfo',
//             params: {cards: [card]}
//         })
//     };


//     try{
//         const fetchedCardInfo = await fetch(ANKICONNECT,options);
//         const cardInfo = await fetchedCardInfo.json();
//         return cardInfo;
//     }catch(error){console.error(error);}
// }




// const getCardQuestionAndAnswer = async (card) => {
//     const cardInfo = await getCardInfo(card);
//     return {
//         question: cardInfo[0].question,
//         answer: cardInfo[0].answer
//     }
// }

const getCurrentCardInfo = async () => {
    // Returns card object when card is active for review in GUI
    // NOTE: because startReview() is invoked, the review session will be initialized
    const options = {
        method: 'POST',
        body: JSON.stringify({
            action: 'guiCurrentCard'
        })};

    try{
        const fetchedCardInfo = await fetch(ANKICONNECT,options);
        const cardInfo = await fetchedCardInfo.json()
        return cardInfo;
    } catch(error){console.error(error);}
}

const returnRenderElements = async (cardInfo) => {
    //TODO: Return images from getImages() (need to decode ? how)
    //TODO: Substitute it in place, do it per array (first element gets first image from getImages()))
    const cardImage = await getImages(cardInfo);

    return {
        question: cardInfo.question,
        answer: cardInfo.answer,
        nextReviews:cardInfo.nextReviews, //Array
        css: cardInfo.css,
        image: cardImage //base64 encoded; <img src="data:image/<filetype>;base64,<cardImage>">
    };
}

const startReview = async() => {
    const options = {
        method: 'POST',
        body: JSON.stringify({
            action: 'guiDeckReview',
            params: {
                name: "JoaoEira"
            }
        })};

    try{
        const fetchedResponse = await fetch(ANKICONNECT,options);
        const response = await fetchedResponse.json();
        return response; //true if review has been/is initialized
    } catch(error){throw new Error(error)}
}

// TODO: Create function to return media files
// TODO: Update returnRenderElements() so that it retrieves media elements (if there are any)
// NOTE: One thing to keep in mind is that doing id.innerHTML = card.question won't work because
//       You have to get the image from somewhere else...


const getImages = async (cardInfo) => {

    const domAnswer = new jsdom.JSDOM(cardInfo.answer);
    const hasImage = domAnswer.window.document.getElementsByTagName('img').length !== 0;

    const options = {
        method: 'POST',
        body: JSON.stringify({
            action: 'retrieveMediaFile',
            params: {
                filename: domAnswer.window.document.getElementsByTagName('img')[0].getAttribute('src').split('/').pop()} //TODO What about multiple images, and svgs (which I think is what Image Clozes uses)?
        })
    };
    try{
        const fetchedResponse = await fetch(ANKICONNECT,options);
        const fetchedJSON = await fetchedResponse.json();
        return fetchedJSON;

    } catch(error){console.error(error);}
}

getCurrentCardInfo().then(cardInfo => {
    getImages(cardInfo).then(html => console.log())
});

// getCurrentCardInfo().then(cardInfo=> {
//     getImages(cardInfo);
// })

module.exports = {
    getCurrentCardInfo: getCurrentCardInfo,
    returnRenderElements: returnRenderElements
}

