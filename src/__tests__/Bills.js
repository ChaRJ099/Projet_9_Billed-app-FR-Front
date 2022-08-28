/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import NewBill from "../containers/NewBill.js";
import BillsUI from "../views/BillsUI.js";
import mockStore from "../__mocks__/store";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon.classList[0]).toEqual("active-icon");
    });
    test("Then bills should be ordered from earliest to latest", () => {
      const dates = screen.queryAllByTestId("date").map((a) => a.innerHTML);
      console.log(dates);

      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    describe("Given I am connected as Employee and I am on Bills page", () => {
      describe("When I click on the icon eye", () => {
        test("A modal should open", () => {
          Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
          });
          window.localStorage.setItem(
            "user",
            JSON.stringify({
              type: "Employee",
            })
          );
          document.body.innerHTML = BillsUI({ data: bills });
          const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
          };

          const billMock = new Bills({
            document,
            onNavigate,
            store: null,
            localStorage: window.localStorage,
          });

          const handleClickIconEye = jest.fn((eye) => {
            billMock.handleClickIconEye(eye);
          });
          const eyes = screen.getAllByTestId("icon-eye");

          const modale = document.querySelector("#modaleFile");
          $.fn.modal = jest.fn(() => modale.classList.add("show"));
          eyes.forEach((eye) => {
            eye.addEventListener("click", handleClickIconEye(eye));
            userEvent.click(eye);
            expect(handleClickIconEye).toHaveBeenCalled();
          });

          expect(modale).toHaveClass("show");
        });
      });
    });
  });
});
