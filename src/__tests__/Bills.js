/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import NewBill from "../containers/NewBill.js";
import BillsUI from "../views/BillsUI.js";
import mockStore from "../__mocks__/store";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

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
      // document.body.innerHTML = BillsUI({ data: bills });
      // const dates = screen
      //   .queryAllByText(
      //     /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
      //   )
      //   .map((a) => a.innerHTML);
      const dates = screen.queryAllByTestId("date").map((a) => a.innerHTML);
      console.log(dates);

      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    // describe("When I click on the icon eye", () => {
    //   test("A modal should open", () => {
    //     const store = null;
    //     const bills = new Bills({
    //       document,
    //       onNavigate,
    //       store,
    //       localStorage: window.localStorage,
    //     });
    //     const handleClickIconEye = jest.fn(bills.handleClickIconEye);
    //     const eye = screen.queryByTestId("icon-eye");

    //     eye.addEventListener("click", handleClickIconEye);
    //     userEvent.click(eye);
    //     // expect(handleClickIconEye).toHaveBeenCalled();

    //     const modale = screen.queryByTestId("modaleFileEmployee");
    //     expect(modale.classList[1]).toEqual("show");
    //   });
    // });
  });
});
