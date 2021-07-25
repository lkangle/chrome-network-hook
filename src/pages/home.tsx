import React from 'react';
import { openFileChoose } from '@/utils';

const Home = () => {
  const handleClick = () => {
    openFileChoose();
  };

  return (
    <div>
      <h3>这是主页</h3>
      <input type="file" onInput={e => console.log(e)} />
      <br />
      <button onClick={handleClick}>选择文件</button>
    </div>
  );
};

export default Home;
