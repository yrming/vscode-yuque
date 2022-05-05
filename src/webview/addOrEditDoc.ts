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
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.1.0/github-markdown.min.css" integrity="sha512-KUoB3bZ1XRBYj1QcH4BHCQjurAZnCO3WdrswyLDtp7BMwCw7dPZngSLqILf68SGgvnWHTD5pPaYrXi6wiRJ65g==" crossorigin="anonymous" referrerpolicy="no-referrer" />
            </head>
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
                    padding: 10px;
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
                    width: 50vw;
                    padding: 10px;
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
                @media (prefers-color-scheme: light) {
                    .markdown-body {
                        color-scheme: light;
                        --color-prettylights-syntax-comment: #8b949e;
                        --color-prettylights-syntax-constant: #79c0ff;
                        --color-prettylights-syntax-entity: #d2a8ff;
                        --color-prettylights-syntax-storage-modifier-import: #c9d1d9;
                        --color-prettylights-syntax-entity-tag: #7ee787;
                        --color-prettylights-syntax-keyword: #ff7b72;
                        --color-prettylights-syntax-string: #a5d6ff;
                        --color-prettylights-syntax-variable: #ffa657;
                        --color-prettylights-syntax-brackethighlighter-unmatched: #f85149;
                        --color-prettylights-syntax-invalid-illegal-text: #f0f6fc;
                        --color-prettylights-syntax-invalid-illegal-bg: #8e1519;
                        --color-prettylights-syntax-carriage-return-text: #f0f6fc;
                        --color-prettylights-syntax-carriage-return-bg: #b62324;
                        --color-prettylights-syntax-string-regexp: #7ee787;
                        --color-prettylights-syntax-markup-list: #f2cc60;
                        --color-prettylights-syntax-markup-heading: #1f6feb;
                        --color-prettylights-syntax-markup-italic: #c9d1d9;
                        --color-prettylights-syntax-markup-bold: #c9d1d9;
                        --color-prettylights-syntax-markup-deleted-text: #ffdcd7;
                        --color-prettylights-syntax-markup-deleted-bg: #67060c;
                        --color-prettylights-syntax-markup-inserted-text: #aff5b4;
                        --color-prettylights-syntax-markup-inserted-bg: #033a16;
                        --color-prettylights-syntax-markup-changed-text: #ffdfb6;
                        --color-prettylights-syntax-markup-changed-bg: #5a1e02;
                        --color-prettylights-syntax-markup-ignored-text: #c9d1d9;
                        --color-prettylights-syntax-markup-ignored-bg: #1158c7;
                        --color-prettylights-syntax-meta-diff-range: #d2a8ff;
                        --color-prettylights-syntax-brackethighlighter-angle: #8b949e;
                        --color-prettylights-syntax-sublimelinter-gutter-mark: #484f58;
                        --color-prettylights-syntax-constant-other-reference-link: #a5d6ff;
                        --color-fg-default: #c9d1d9;
                        --color-fg-muted: #8b949e;
                        --color-fg-subtle: #484f58;
                        --color-canvas-default: #0d1117;
                        --color-canvas-subtle: #161b22;
                        --color-border-default: #30363d;
                        --color-border-muted: #21262d;
                        --color-neutral-muted: rgba(110,118,129,0.4);
                        --color-accent-fg: #58a6ff;
                        --color-accent-emphasis: #1f6feb;
                        --color-attention-subtle: rgba(187,128,9,0.15);
                        --color-danger-fg: #f85149;
                    }
                }
            </style>
            <body>
                <div class="container">
                    <div class="text-area-container" style="${onlyPreview ? 'display: none' : ''}">
                        <textarea class="markdown" placeholder="# Hello World&#10&#10$$r = a(1-sinθ)$$">${docStr}</textarea>
                        <button class="publish-btn">发布</button>
                    </div>
                    <div class="preview-container markdown-body" style="${
                      onlyPreview ? 'width: 100vw' : ''
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
