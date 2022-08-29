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

jest.mock("../app/store", () => mockStore);

// On vérifie que le contenu de la page NewBill apparait
describe("Given I am on NewBill Page", () => {
  test("Then I should see the newbill page's title", async () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ type: "Employee", email: "a@a" })
    );
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
    window.onNavigate(ROUTES_PATH.NewBill);
    const titlePage = await screen.getByText("Envoyer une note de frais");
    // On s'attend à voir le titre de la page
    expect(titlePage).toBeTruthy();
  });

  describe("When I am on NewBill Page", () => {
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

    // describe("When I submit a new Bill", () => {
    //   test("Then must save the bill", () => {
    //     const onNavigate = (pathname) => {
    //       document.body.innerHTML = ROUTES({ pathname });
    //     };

    //     Object.defineProperty(window, "localStorage", {
    //       value: localStorageMock,
    //     });
    //     window.localStorage.setItem(
    //       "user",
    //       JSON.stringify({
    //         type: "Employee",
    //       })
    //     );

    //     const html = NewBillUI();
    //     document.body.innerHTML = html;
    //     const newBillMock = new NewBill({
    //       document,
    //       onNavigate,
    //       store: null,
    //       localStorage: window.localStorage,
    //     });

    //     const formNewBill = screen.getByTestId("form-new-bill");
    //     const handleSubmit = jest.fn((e) => newBillMock.handleSubmit(e));

    //     formNewBill.addEventListener("submit", handleSubmit);
    //     fireEvent.submit(formNewBill);
    //     expect(handleSubmit).toHaveBeenCalled();
    //     expect(formNewBill).toBeTruthy();
    //   });
    // });
  });

  describe("If the file is valid", () => {
    test("Then the updateBill method should be called", () => {
      const html = NewBillUI();
      const testUser = {
        type: "Employee",
        email: "test@test.com",
      };
      window.localStorage.setItem("user", JSON.stringify(testUser));
      document.body.innerHTML = html;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBillMock = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage,
      });
      const form = screen.getByTestId("form-new-bill");
      // const submitBtn = screen.getByRole("submit");
      const updateBillTest = jest.fn(() => newBillMock.updateBill());

      // newBill.fileName = "test";
      fireEvent.submit(form);
      expect(updateBillTest).toHaveBeenCalled();
    });
  });
});
