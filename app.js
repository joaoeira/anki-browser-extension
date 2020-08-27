const express = require('express');
const fetch = require('node-fetch');
const jsdom = require('jsdom')
const app = express();

const ANKICONNECT = 'http://127.0.0.1:8765';

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
    //TODO: Substitute it in place, do it per array (first element gets first image from getImages()))
    const cardImage = await getImages(cardInfo);
    
    return {
        question: cardInfo.question,
        questionImages: cardImage[0], //base64 encoded; <img src="data:image/<filetype>;base64,<cardImage>">
        answer: cardInfo.answer,
        answerImages: cardImage[1],   //base64 encoded; <img src="data:image/<filetype>;base64,<cardImage>">
        nextReviews:cardInfo.nextReviews, //Array
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
    } catch(error){throw new Error(error)}
}


const getImages = async cardInfo => {
    // Input: cardInfo object
    // Output: 2-slot array, 1st with array of images in question section, 2nd with array of images in output section (base64 encoded)

    const domQuestion = new jsdom.JSDOM(cardInfo.question);
    const domAnswer = new jsdom.JSDOM(cardInfo.answer);

    const domQuestionImages = Object.values(domQuestion.window.document.getElementsByTagName('img'));
    const domAnswerImages = Object.values(domAnswer.window.document.getElementsByTagName('img'));
    
    const imagesArray = [];

    async function getSectionImages(domSectionImages){
        //TODO: What about what isnt img?
        try{

            let imageArray = [];
            for(let i = 0; i < domSectionImages.length;++i){

                const options = {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'retrieveMediaFile',
                        params: {
                            filename: domSectionImages[i].getAttribute('src')} 
                    })
                };

                const fetchedResponse = await fetch(ANKICONNECT,options);
                const fetchedJSON = await fetchedResponse.json();
                imageArray.push(fetchedJSON);
            }

            return imageArray;
        } catch(error){console.error(error);}
    }
    imagesArray.push(await getSectionImages(domQuestionImages));
    imagesArray.push(await getSectionImages(domAnswerImages));
    return imagesArray;
}


module.exports = {
    getCurrentCardInfo: getCurrentCardInfo,
    returnRenderElements: returnRenderElements
}
