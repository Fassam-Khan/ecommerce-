import React from 'react';

const Check = () => {
  return (
    <div className="dark:bg-black/10 w-5 h-5">
      <label className="text-white">
        <input className="dark:border-white-400/20 dark:scale-100 transition-all duration-500 ease-in-out dark:hover:scale-110 dark:checked:scale-100 w-10 h-10" type="checkbox" />
      </label>
    </div>
  );
}

export default Check;
