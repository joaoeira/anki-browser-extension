const express = require('express');
const fetch = require('node-fetch');

const app = express();

const ANKICONNECT = 'http://127.0.0.1:8765';



// fetch(ANKICONNECT,getCurrentCard)
//     .then(res => {
//         res.json().then(data => {
//             console.log([data.question,data.answer])})
//     });

const getDueCards = async () => {
    const options = {
        method: 'POST',
        body: JSON.stringify({
            action: 'findCards',
            params: {query: "is:due"}
        })
    }
    try{
        const fetchedDeckCards = await fetch(ANKICONNECT,options);
        const deckCards = await fetchedDeckCards.json();
        return deckCards;
    } catch(error){console.error(error);}
}



const getCardInfo = async (card) => {
    const options = {
        method: 'POST',
        body: JSON.stringify({
            action: 'cardsInfo',
            params: {cards: [card]}
        })
    };

    try{
        const fetchedCardInfo = await fetch(ANKICONNECT,options);
        const cardInfo = await fetchedCardInfo.json();
        return cardInfo;
    }catch(error){console.error(error);}
}




const getCardQuestionAndAnswer = async (card) => {
    const cardInfo = await getCardInfo(card);
    return {
        question: cardInfo[0].question,
        answer: cardInfo[0].answer
    }
}

const getCurrentCardInfo = async () => {
    // Returns card object when card is active for review in GUI
    // NOTE: because startReview() is invoked, the review session will be initialized
    const options = {
        method: 'POST',
        body: JSON.stringify({
            action: 'guiCurrentCard'
        })};

    try{
        if(await startReview()){
            const fetchedCardInfo = await fetch(ANKICONNECT,options);
            const cardInfo = await fetchedCardInfo.json();
            return cardInfo;
        } else {
            throw new Error("Review was not initiated");
        }
    } catch(error){console.error(error);}
}

const returnRenderElements = async (cardInfo) => {
    // Render elements are: {question,answer,nextReviews,css}
    return {
        question: cardInfo.question,
        answer: cardInfo.answer,
        nextReviews:cardInfo.nextReviews,
        css: cardInfo.css
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
    } catch(error){console.error(error);}
}

// TODO: Create function to return media files
// TODO: Update returnRenderElements() so that it retrieves media elements (if there are any)


module.exports = {
    getCurrentCardInfo: getCurrentCardInfo,
    returnRenderElements: returnRenderElements
}

