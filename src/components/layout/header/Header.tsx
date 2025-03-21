import scss from "./Header.module.scss";

const Header= () => {
  return (
    <header className={scss.Header}>
      <div className="container">
        <div className={scss.content}>
          <h1>Header</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
