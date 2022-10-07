import { markdown } from './markdown'
import { highlight } from './highlight'

export function getHTMLContent(title: string = '', docStr: string = '', onlyPreview = false) {
  const html = `
        <!doctype html>
        <html>
            <head>
                <meta charset="utf-8"/>
                <title>${title}</title>
                <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
                <script>
                    MathJax = {
                        tex: {
                            inlineMath: [['$', '$'],
                            ['\\(', '\\)']]
                        },
                        startup: {
                            ready: function () {
                                MathJax.startup.defaultReady();
                            }
                        }
                    }
                </script>
                <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
            </head>
            <style>
                ${markdown}
            </style>
            <style>
                ${highlight}
            </style>
            <style>
                .container {
                    display: flex;
                    min-height: 100vh;
                }
                .text-area-container {
                    position: relative;
                    width: 50vw;
                    display: flex;
                    border-right: 1px solid #999;
                    padding-top: 10px;
                    padding-bottom: 10px;
                    background: var(--vscode-input-background);

                }
                textarea:focus {
                    outline: 0;
                }
                textarea {
                    flex: 1;
                    outline: none;
                    resize: none;
                    border: none;
                    padding: 0;
                    background-color: transparent;
                    caret-color: #fff;
                    font-size: 13px;
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-input-foreground);
                }
                .publish-btn {
                    position: fixed;
                    left: 0;
                    right: 50%;
                    bottom: 25px;
                    width: 100px;
                    margin: 0 auto;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    font-family: var(--vscode-font-family);
                    border-radius: 0px;
                    border: 1px solid transparent;
                    outline: none;
                    padding: 4px 12px;
                    font-size: 13px;
                    line-height: 18px;
                    white-space: nowrap;
                    user-select: none;
                }
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                    cursor: pointer;
                }
                .preview-container {
                    padding-top: 10px;
                    padding-bottom: 10px;
                    width: 50vw;
                    background: transparent;
                }
                .empty-container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .empty-container img {
                    width: 100px;
                    height: auto;
                    background-color: transparent !important;
                }
            </style>
            <body>
                <div class="container">
                    <div class="text-area-container" style="${
                      onlyPreview ? 'display: none' : 'padding-right: 46px;'
                    }">
                        <textarea class="markdown" placeholder="# Hello World&#10&#10$$r = a(1-sinθ)$$">${docStr}</textarea>
                        <button class="publish-btn">发布</button>
                    </div>
                    <div class="preview-container markdown-body" style="${
                      onlyPreview ? 'width: 100vw; padding-left: 0;' : 'padding-left: 46px;'
                    }">
                        <div class="empty-container">
                            <img src="https://gw.alipayobjects.com/mdn/prod_resou/afts/img/A*Q-bIT76mSLUAAAAAAAAAAAAAARQnAQ" />
                        </div>
                    </div>
                </div>
                <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
                <script>
                    const $markdownElem = document.querySelector('.markdown');
                    $markdownElem.focus();
                    $markdownElem.addEventListener('change', handleInput, false);
                    $markdownElem.addEventListener('keyup', handleInput, false);
                    $markdownElem.addEventListener('keypress', handleInput, false);
                    $markdownElem.addEventListener('keydown', handleInput, false);

                    function handleInput(e) {
                        const value = marked.parse($markdownElem.value)
                        if (value) {
                            document.querySelector('.preview-container').innerHTML = value;
                            typeof MathJax.texReset === 'function' && MathJax.texReset();
                            typeof MathJax.typesetClear === 'function' && MathJax.typesetClear();
                            typeof MathJax.typesetPromise === 'function' && MathJax.typesetPromise();
                        } else {
                            document.querySelector('.preview-container').innerHTML = '<div class="empty-container"><img src="https://gw.alipayobjects.com/mdn/prod_resou/afts/img/A*Q-bIT76mSLUAAAAAAAAAAAAAARQnAQ" /></div>'
                        }
                    }

                    handleInput();

                    const vscode = acquireVsCodeApi();
                    const $publishBtnElem = document.querySelector('.publish-btn');
                    $publishBtnElem.addEventListener('click', function() {
                        if ($markdownElem.value) {
                            vscode.postMessage({
                                command: 'publish',
                                text: $markdownElem.value
                            })
                        }
                    })
                </script>
            </body>
        </html>
    `
  return html
}
