// ==UserScript==
// @name         Etheriopia - fix twitter.com crypto rendering
// @namespace    Etheriopia
// @version      0.1.0
// @description  Fix bugs with Twitter's rendering of cryptocurrencies
// @author       a shadowy super coder
// @license      GPL-3.0-or-later; https://www.gnu.org/licenses/gpl-3.0.txt
// @match        https://twitter.com/*
// @icon         https://www.google.com/s2/favicons?domain=twitter.com
// @downloadURL  https://raw.githubusercontent.com/aspiers/etheriopia/master/etheriopia.user.js
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://greasyfork.org/scripts/5392-waitforkeyelements/code/WaitForKeyElements.js?version=115012
// @resource     ethereum-icon https://img.icons8.com/color/50/000000/ethereum.png
// @resource     btc-icon http://www.betontool.com/wp-content/uploads/2019/03/btc-mob-logo.png
// @grant        GM_getResourceURL
// @grant        GM_addStyle
// ==/UserScript==
//
// Browser userscript to fix bugs in twitter.com rendering
// Copyright (C) 2021 a shadowy super coder <blockchain@adamspiers.org>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

// Stop JSHint in Tampermonkey's CodeMirror editor from complaining
// about globals imported via @require:
// https://jshint.com/docs/#inline-configuration
/* globals jQuery waitForKeyElements */

(function() {
    'use strict';
    let $ = jQuery;
    unsafeWindow.jQuery = jQuery;

    const CSS = `
        img.Ethereum {
            position: relative;
            top: 3px;
        }
        img.BTC {
            position: relative;
            top: 3px;
        }
    `;

    const ETHEREUM_PNG = GM_getResourceURL("ethereum-icon");
    const BTC_PNG = GM_getResourceURL("btc-icon");

    const BTC_REPLACEMENT =
          `<a href="http://www.betontool.com/"><img class="BTC" src="${BTC_PNG}" height="24px" /></a>`;

    const REPLACEMENTS = [
        [
            "img[src*=Olympics_Countries_2021_ETH]",
            `<img class="Ethereum" src="${ETHEREUM_PNG}" width="24px" />🦇🔊`
        ],
        [
            "img[src*=Bitcoin_evergreen]",
            (matches) => {
                let links = jQuery(matches).parent();
                // debug("BTC", links);
                replace_matches(links, BTC_REPLACEMENT);
            }
        ],
    ];

    // Don't replace more often than this number of milliseconds.
    const DEBOUNCE_MS = 2000;

    const PREFIX = "[Etheriopia]";

    function debug(...args) {
        console.debug(PREFIX, ...args);
    }

    function log(...args) {
        console.log(PREFIX, ...args);
    }

    function replace_with_selector(selector, replacement) {
        let matches = jQuery(selector);
        replace_matches(matches, replacement);
    }

    function replace_matches(matches, replacement) {
        // debug(`replacing ${query}`, matches);
        if (matches && matches.each) {
            matches.each((i, elt) => {
                // debug(`${i}: replacing`, elt, `with ${replacement}`);
                elt.outerHTML = replacement;
            });
        }
        else {
            debug("Got no matches");
        }
    }

    let lastWaited = {};

    function init() {
        GM_addStyle(CSS);

        for (let [selector, replacer] of REPLACEMENTS) {
            waitForKeyElements(
                selector,
                () => {
                    debug("waitForKeyElements triggered for", selector);
                    let last = lastWaited[selector];
                    if (!last || (new Date() - last > DEBOUNCE_MS)) {
                        if (typeof(replacer) === "string") {
                            replace_with_selector(selector, replacer);
                        }
                        else {
                            let matches = jQuery(selector);
                            replacer(matches);
                        }
                        lastWaited[selector] = new Date();
                    }
                    else {
                        debug("debounce");
                    }
                }
            );
        }
    }

    init();
})();
