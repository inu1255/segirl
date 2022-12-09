import app from "@/plugins/store/app";
import { bindHotkeys, listen } from "@/common/utils";

declare module "vue/types/vue" {
	interface Vue {
		$app: typeof app;
		$local: typeof app.local;
		$toast: typeof app.toast;
		$dlg: typeof app.dlg;
		$listen: typeof listen;
		$hotkey: typeof bindHotkeys;
	}
}
