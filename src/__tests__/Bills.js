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
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
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

    describe("When I click on the icon eye", () => {
      test("Then a modal should open", () => {
        const billMock = new Bills({
          document,
          onNavigate: (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
          },
          store: null,
          localStorage: window.localStorage,
        });

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

    describe("When I click on Nouvelle note de frais", () => {
      // Vérifie si le formulaire de création de bills apparait
      test("Then the form to create a new bill appear", async () => {
        const billMock = new Bills({
          document,
          onNavigate: (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
          },
          store: null,
          localStorage: window.localStorage,
        });

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
        const handleClickNewBill = jest.fn(() => billMock.handleClickNewBill());
        const btnNewBill = screen.getByTestId("btn-new-bill");
        btnNewBill.addEventListener("click", handleClickNewBill);
        userEvent.click(btnNewBill);
        expect(handleClickNewBill).toHaveBeenCalled();
        await waitFor(() => screen.getByTestId("form-new-bill"));
        expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      });
    });
  });

  // test d'intégration GET
  describe("Given I am a user connected as Employee", () => {
    describe("When I navigate to Bills page", () => {
      test("fetches bills from mock API GET", async () => {
        localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee", email: "a@a" })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();
        window.onNavigate(ROUTES_PATH.Bills);
        await waitFor(() => screen.getAllByText("Accepté"));
        const contentPending = await screen.getAllByText("En attente");
        expect(contentPending).toBeTruthy();
        const contentRefused = await screen.getAllByText("Refusé");
        expect(contentRefused).toBeTruthy();
      });
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
  });
});
