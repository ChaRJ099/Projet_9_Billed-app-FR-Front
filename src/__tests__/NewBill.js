/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import { jest } from "@jest/globals";
import "@testing-library/jest-dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import mockStore from "../__mocks__/store";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import router from "../app/Router.js";
import isGoodFileExt from "../containers/NewBill.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  // On vérifie qu'on est envoyé vers la page NewBill
  describe("When I click on NewBill'buton", () => {
    test("Then I render to the newbill page", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      await router();
    });
    // On vérifie le chemin de la page newBill
    const newBillPath = ROUTES_PATH.NewBill;
    expect(newBillPath).toContain("#employee/bill/new");
  });

  describe("When I am on NewBill Page", () => {
    // On vérifie que le contenu de la page est chargé
    test("Then new bill icon in vertical layout should be highlighted", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      let root = document.createElement("div");
      root.setAttribute("id", "root");
      window.location.assign(ROUTES_PATH["NewBill"]);
      document.body.appendChild(root);
      router();
      const billsIcon = screen.getByTestId("icon-mail");
      expect(billsIcon.classList.contains("active-icon")).toBeTruthy();
    });

    describe("When I submit a valid new Bill with newBill form", () => {
      // Vérifie si un fichier est bien chargé
      test("Then verify the file bill", async () => {
        jest.spyOn(mockStore, "bills");

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        Object.defineProperty(window, "location", {
          value: { hash: ROUTES_PATH["NewBill"] },
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        const html = NewBillUI();
        document.body.innerHTML = html;

        const newBillMock = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        const file = new File(["image"], "image.png", { type: "image/png" });
        const handleChangeFile = jest.fn((e) =>
          newBillMock.handleChangeFile(e)
        );
        const formNewBill = screen.getByTestId("form-new-bill");
        const champFile = screen.getByTestId("file");

        champFile.addEventListener("change", handleChangeFile);
        userEvent.upload(champFile, file);

        expect(champFile.files[0].name).toBeDefined();
        expect(handleChangeFile).toBeCalled();

        const handleSubmit = jest.fn((e) => newBillMock.handleSubmit(e));
        formNewBill.addEventListener("submit", handleSubmit);
        fireEvent.submit(formNewBill);
        expect(handleSubmit).toHaveBeenCalled();
      });

      // Vérifie que le bill se sauvegarde
      test("Then the new bill must be submited", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        const html = NewBillUI();
        document.body.innerHTML = html;

        const newBillMock = new NewBill({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage,
        });

        const formNewBill = screen.getByTestId("form-new-bill");
        expect(formNewBill).toBeTruthy();

        const handleSubmit = jest.fn((e) => newBillMock.handleSubmit(e));
        formNewBill.addEventListener("submit", handleSubmit);
        fireEvent.submit(formNewBill);
        expect(handleSubmit).toHaveBeenCalled();
      });
    });
  });

  describe("When file uploaded is correct", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      Object.defineProperty(window, "location", {
        value: { hash: ROUTES_PATH["NewBill"] },
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const html = NewBillUI();
      document.body.innerHTML = html;
    });

    test("Then the file's extension is jpg", () => {
      const newBillMock = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const file = new File(["image"], "image.jpg", { type: "image/jpg" });
      const fileName = file.name;
      const fileExtension = fileName.substring(fileName.lastIndexOf("."));
      const champFile = screen.getByTestId("file");
      const handleChangeFile = jest.spyOn(newBillMock, "handleChangeFile");
      const isGoodFileExt = jest.spyOn(newBillMock, "isGoodFileExt");

      champFile.addEventListener("change", handleChangeFile);
      userEvent.upload(champFile, file);

      expect(handleChangeFile).toHaveBeenCalled();
      expect(isGoodFileExt).toHaveBeenCalled();
      expect(isGoodFileExt(fileExtension)).toBeTruthy();
    });
  });

  describe("When file uploaded is not correct", () => {
    test("Then the file's the extension is neither jpg nor png nor jpeg", () => {
      const newBillMock = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const file = new File(["image"], "image.pdf", { type: "image/pdf" });
      const fileName = file.name;
      const fileExtension = fileName.substring(fileName.lastIndexOf("."));
      const champFile = screen.getByTestId("file");

      const handleChangeFile = jest.spyOn(newBillMock, "handleChangeFile");
      const isGoodFileExt = jest.spyOn(newBillMock, "isGoodFileExt");

      champFile.addEventListener("change", handleChangeFile);
      userEvent.upload(champFile, file);

      expect(handleChangeFile).toHaveBeenCalled();
      expect(isGoodFileExt).toHaveBeenCalled();
      expect(isGoodFileExt(fileExtension)).toBeFalsy();
    });
  });

  // test d'intégration POST

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });

      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
