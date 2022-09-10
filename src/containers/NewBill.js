import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener("submit", this.handleSubmit);

    const file = this.document.querySelector(`input[data-testid="file"]`);

    file.addEventListener("change", this.handleChangeFile);

    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }

  handleChangeFile = (e) => {
    console.log("handleChangeFile");
    e.preventDefault();
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];

    const fileName = file.name;
    const fileExtension = fileName.substring(fileName.lastIndexOf("."));
    const champFile = document.querySelector(`input[data-testid="file"]`);

    /* Si l'extension du fichier est égale à jpeg OU jpg OU png */
    if (this.isGoodFileExt(fileExtension)) {
      console.log("Le format est valide");
      champFile.setCustomValidity("");
    } else {
      /* Si le format n'est pas valide on enlève l'avertissement et on valide */
      console.log("Le format doit être JPG, JPEG ou PNG");
      champFile.setCustomValidity("Le format doit être JPG, JPEG ou PNG");
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];

    const fileName = file.name;
    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;
    formData.append("file", file);
    formData.append("email", email);

    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      ),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct:
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
        .value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };
    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true,
        },
      })
      .then(({ fileUrl, key }) => {
        this.billId = key;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
        this.updateBill(bill);
        this.onNavigate(ROUTES_PATH["Bills"]);
      })
      .catch((error) => console.error(error));
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };

  isGoodFileExt = (fileExtension) => {
    const fileExtLowerCase = fileExtension.toLowerCase();

    console.log("fileExtension");
    console.log(fileExtLowerCase);

    if (
      fileExtLowerCase == ".jpg" ||
      fileExtLowerCase == ".png" ||
      fileExtLowerCase == ".jpeg"
    ) {
      return true;
    } else {
      return false;
    }
  };
}
