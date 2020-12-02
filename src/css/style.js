import { css } from 'lit-element'

export const style = css`

/* scroll bar and selection */
::-webkit-scrollbar {
    width: 6px;
    background-color: #000;
}
 
::-webkit-scrollbar-track {
    background-color: #334;
}
 
::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: #232333;
}

:host {
  height: 100%;
  padding: 5px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  justify-content: center;
}

:host(.shadow)::before {
  content: '';
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  background: #000;
  width: 100%;
  height: 100%;
  opacity: 0.6;
}

:host(.shadow)::after {
  display: flex;
  width: 50%;
  height: 20%;
  content: 'Drop files';
  top: 40%;
  left: 25%;
  position: absolute;
  font-size: 50px;
  border: 2px dashed #fff;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  color: white;
}

:host(.unsupp)::before {
    content: 'Unsupported file type';
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #803232ba;
    width: 100%;
    height: 100%;
    font-size: 50px;
}

.btn-select-dir {
  width: 80%;
  height: 30%;
  border: 3px dashed #434366;
  border-radius: 10px;
  background: #33333320;

  display: flex;
  align-items: center;
  justify-content: center;
  transition: .2s;

  outline: none;
}

.btn-select-dir .text {
  color: #eee;
  font-size: 40px;
  padding: 15px;
  background-color: #575699;
  border-radius: 10px;
}


.btn-select-dir:hover {
  filter: brightness(1.2);
  transform: scale(1.05);
}

.files-container {
  display: flex;
  height: 95%;

  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  overflow-x: auto;
  padding: 20px;
  box-sizing: border-box;
}

.ctrl-container:not(.hider) .file-wrap:hover {
  transform: scale(1.2);
}

.ctrl-container.hider .file-wrap:hover {
  cursor: no-drop;
}

.file-wrap {
  background-color: #5d5d7e;
  border-radius: 5px;
  margin: 5px;
  color: #eee;

  width: 130px;
  max-height: 200px;
  overflow: hidden;
  transition: .2s;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.files-container:not([hidden]) .file-wrap[hidden] {
  display: none;
}

.files-container[hidden] .file-wrap[hidden] {
  filter: grayscale(.8);
}

.file-wrap.active {
  background-color: #8585d0;
}

.file-wrap img {
  width: 130px;
  height: 130px;
  max-height: 80%;
  border-radius: 5px 5px 0 0;
  object-fit: cover;
}

.file-wrap span {
  padding: 5px;
  word-break: break-all;
  display: inline-block;
  margin-bottom: 5px;
}

.file-wrap:not(.favorite):not(:hover) .btn-fav {
  display: none;
}

.btn-fav {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  outline: none;
  cursor: pointer;
  border: none;
  background: transparent;
  padding: 0;
}

.conf-buttons {
  display: flex;
  flex: 1 1 0px;
}

.btn-conf {
  flex-grow: 1;
  margin: 2px;
}

.btn-push {
  outline: none;
  border-radius: 5px;
  padding: 2px 5px;
  border: none;
  transition: .1s;
  color: #eee;
}

.btn-push:hover {
  filter: brightness(1.2);
}

.btn-push.false {
  background-color: #555;
}

.btn-dump:active,
.btn-push.true {
  background-color: #8585d0;
}

.ctrl-container {
  display: grid;
  grid-template-rows: 40px 20px 1fr;
  height: 100%;
  grid-gap: 10px;
  width: 100%;
}

`;
