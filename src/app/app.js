import Cycle from '@cycle/core';
import {makeDOMDriver, h} from '@cycle/dom';
import {makeHTTPDriver} from '@cycle/http';

const HACKER_NEWS_URL = 'https://whispering-fortress-7282.herokuapp.com/';

function renderStoryCell(story) {
    console.log("renderStoryCell");
    console.dir(story);
    return h('div.story-details', [
        h('h1.story-title', story.title),
        h('h4.story-user', story.user),
        h('a.story-url', { href: story.url }, story.url)
    ])
}

function requestStory(itemId) {
    console.log("requestStory");
    return {
        url: HACKER_NEWS_URL + 'item/' + String(itemId),
        method: 'GET'
    };
}

function model(actions) {
    console.log("model");
    let state$ = Cycle.Rx.Observable.combineLatest(
        actions.click$.map(requestStory()),
        actions.story$
        );
    return state$;
}

function view(state$) {
    console.log("view");
    let vtree$ = state$.map(({story}) =>
        h('div', [
            h('button.get-story', 'Get Story'),
            story === null ? null : renderStoryCell(story)
        ])
        );
    return vtree$;
}

function intent(DOM, HTTP) {
    console.log("intent")
    let actions = {
        click$: DOM.select('.get-story').events('click'),
        story$: HTTP.filter(res$ => res$.request.url.indexOf(HACKER_NEWS_URL) === 0)
            .mergeAll()
            .map(res => res.body)
            .startWith(null)
    };
    return actions;
}

function main({DOM, HTTP}) {
    return {
        DOM: view(model(intent(DOM, HTTP))),
        HTTP: model(intent(DOM, HTTP))
    };
}

let drivers = {
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver()
}

Cycle.run(main, drivers);

