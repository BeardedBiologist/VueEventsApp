import { createStore } from "vuex";
import db from "../firebase/firebaseinit";

export default createStore({
  state: {
    eventData: [],
    eventModal: null,
    modalActive: null,
    eventsLoaded: null,
    currentEventArray: null,
    editEvent: null,
  },
  mutations: {
    TOGGLE_EVENT(state) {
      state.eventModal = !state.eventModal;
    },
    TOGGLE_MODAL(state) {
      state.modalActive = !state.modalActive;
    },
    SET_EVENT_DATA(state, payload) {
      state.eventData.push(payload);
    },
    EVENTS_LOADED(state) {
      state.eventsLoaded = true;
    },
    SET_CURRENT_EVENT(state, payload) {
      state.currentEventArray = state.eventData.filter((event) => {
        return event.eventId === payload;
      });
    },
    TOGGLE_EDIT_EVENT(state) {
      state.editEvent = !state.editEvent;
    },
    DELETE_EVENT(state, payload) {
      state.eventData = state.eventData.filter((event) => event.docId !== payload);
    },
    UPDATE_STATUS_TO_PUBLISHED(state, payload) {
      state.eventData.forEach((event) => {
        if (event.docId === payload) {
          event.eventPublished = true;
          event.eventPending = false;
        }
      });
    },
    UPDATE_STATUS_TO_PENDING(state, payload) {
      state.eventData.forEach((event) => {
        if (event.docId === payload) {
          event.eventPublished = false;
          event.eventPending = true;
          event.eventDraft = false;
        }
      });
    }
  },
  actions: {
    async GET_EVENTS({ commit, state }) {
      const getData = db.collection("events");
      const results = await getData.get();
      results.forEach((doc) => {
        if (!state.eventData.some((event) => event.docId === doc.id)) {
          const data = {
            docId: doc.id,
            eventId: doc.data().eventId,
            billerStreetAddress: doc.data().billerStreetAddress,
            billerCity: doc.data().billerCity,
            billerZipCode: doc.data().billerZipCode,
            billerCountry: doc.data().billerCountry,
            clientName: doc.data().clientName,
            clientEmail: doc.data().clientEmail,
            clientStreetAddress: doc.data().clientStreetAddress,
            clientCity: doc.data().clientCity,
            clientZipCode: doc.data().clientZipCode,
            clientCountry: doc.data().clientCountry,
            eventDateUnix: doc.data().eventDateUnix,
            eventDate: doc.data().eventDate,
            paymentTerms: doc.data().paymentTerms,
            paymentDueDateUnix: doc.data().paymentDueDateUnix,
            paymentDueDate: doc.data().paymentDueDate,
            productDescription: doc.data().productDescription,
            eventItemList: doc.data().eventItemList,
            eventTotal: doc.data().eventTotal,
            eventPending: doc.data().eventPending,
            eventDraft: doc.data().eventDraft,
            eventPublished: doc.data().eventPublished,
          };
          commit("SET_EVENT_DATA", data);
        }
      });
      commit("EVENTS_LOADED");
    },
    async UPDATE_EVENT({ commit, dispatch }, { docId, routeId }) {
      commit("DELETE_EVENT", docId);
      await dispatch("GET_EVENTS");
      commit("TOGGLE_EVENT");
      commit("TOGGLE_EDIT_EVENT");
      commit("SET_CURRENT_EVENT", routeId);
    },
    async DELETE_EVENT({ commit }, docId) {
      const getEvent = db.collection("events").doc(docId);
      await getEvent.delete();
      commit("DELETE_EVENT", docId);
    },
    async UPDATE_STATUS_TO_PUBLISHED({ commit }, docId) {
      const getEvent = db.collection("events").doc(docId);
      await getEvent.update({
        eventPublished: true,
        eventPending: false,
      });
      commit("UPDATE_STATUS_TO_PUBLISHED", docId);
    },
    async UPDATE_STATUS_TO_PENDING({ commit }, docId) {
      const getEvent = db.collection("events").doc(docId);
      await getEvent.update({
        eventPublished: false,
        eventPending: true,
        eventDraft: false,
      });
      commit("UPDATE_STATUS_TO_PENDING", docId);
    }
  },
  modules: {},
});
