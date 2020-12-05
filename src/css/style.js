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
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
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
  z-index: 10;
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
  z-index: 11;
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
  z-index: 10;
}

#killed, #offline {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #893a3a;
  justify-content: center;
  align-items: center;
  font-size: 50px;
  text-align: center;
}

#loading {
  font-size: 50px;
}

.files-container {
  display: flex;
  height: 95%;

  flex-wrap: wrap;
  place-content: flex-start center;
  width: 100%;
  overflow-x: auto;
  padding: 20px;
  box-sizing: border-box;
}

.ctrl-container:not(.hider) .file-wrap:focus-visible,
.ctrl-container:not(.hider) .file-wrap:hover {
  transform: scale(1.2);
  z-index: 1;
}

.ctrl-container.hider .file-wrap:hover {
  cursor: no-drop;
}

.file-wrap {
  background-color: #5d5d7e;
  border-radius: 5px;
  margin: 5px;
  color: #eee;

  width: 150px;
  max-height: 220px;
  overflow: hidden;
  transition: .2s;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  outline: none;
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

.file-wrap .img-wrap {
  padding-top: 100%;
  position: relative;
}

.file-wrap img {
  object-fit: cover;
  position: absolute;
  inset: 0px;
  width: 100%;
  height: 100%;
}

.file-wrap span {
  padding: 5px;
  word-break: break-all;
  display: inline-block;
  margin-bottom: 5px;
  font-size: small;
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

.btn-push {
  outline: none;
  border-radius: 5px;
  padding: 2px 5px;
  border: none;
  transition: .1s;
  color: #eee;
  font-size: 18px;
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
  border-color: #a4a4f9;
}

.conf-buttons {
  display: flex;
  flex: 1 1 0px;
  border-radius: 7px;
  max-width: 800px;
}

.btn-conf {
  flex-grow: 1;
  margin: 0px;
  border-radius: 0;
  border-right: 2px solid grey;
}

.btn-conf:first-child {
  border-radius: 5px 0 0 5px;
}

.btn-conf:last-child {
  border-right: none;
  border-radius: 0 5px 5px 0;
}

.ctrl-container {
  display: grid;
  grid-template-rows: 30px 30px 1fr;
  height: 100%;
  grid-gap: 10px;
  width: 100%;
}


`;
