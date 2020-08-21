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


const getImages = async (cardInfo) => {
    //TODO: Refactor function to return array of image data
    const domAnswer = new jsdom.JSDOM(cardInfo.answer);

    const domImages = Object.values(domAnswer.window.document.getElementsByTagName('img'));
    //TODO: What about what isnt img?
    //BUG: Why are the first two objects in the array empty? 
    try{

        let imageArray;

        await Promise.all(

            imageArray = domImages.map(async item  =>  {

            const options = {
                method: 'POST',
                body: JSON.stringify({
                    action: 'retrieveMediaFile',
                    params: {
                        filename: item.getAttribute('src')} 
                })
            };


            const fetchedResponse = await fetch(ANKICONNECT,options);
            const fetchedJSON = await fetchedResponse.json();
            imageArray.push(fetchedJSON);

            })
        );
        return imageArray;

    } catch(error){console.error(error);}
    }


module.exports = {
    getCurrentCardInfo: getCurrentCardInfo,
    returnRenderElements: returnRenderElements
}
