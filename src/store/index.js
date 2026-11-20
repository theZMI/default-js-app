import { createStore } from 'vuex'
import { networkInformation } from "@/store/networkInformation";

export default createStore({
  modules: {
    networkInformation,
  },
});
