import { css } from 'lit-element'

export const style = css`
:host {
  height: 100%;
  padding: 5px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  justify-content: center;
}

:host(.shadow) {
  filter: brightness(.6);
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
  height: 80%;

  flex-wrap: wrap;
  justify-content: center;
}

.file-wrap:hover {
  transform: scale(1.2);
}

.file-wrap {
  background-color: #5d5d7e;
  border-radius: 5px;
  margin: 5px;
  color: #eee;

  width: 15%;
  height: 50%;
  overflow: hidden;
  transition: .2s;
}

.file-wrap img {
  width: 100%;
  max-height: 80%;
  border-radius: 5px 5px 0 0;
}

.file-wrap span {
  padding: 5px;
  word-break: break-all;
  display: inline-block;
}

.conf-buttons {
  display: flex;
  flex: 1 1 0px;
}

.btn-conf {
  flex-grow: 1;
  outline: none;
  border-radius: 5px;
  padding: 5px 0;
  border: none;
  transition: .1s;
  color: #eee;
  margin: 2px;
}

.btn-conf:hover {
  filter: brightness(1.2);
}

.btn-conf.false {
  background-color: #555;
}

.btn-conf.true {
  background-color: #8585d0;
}

.ctrl-container {
  display: grid;
  grid-template-rows: 40px 1fr;
  height: 100%;
  grid-gap: 50px;
}
`;
