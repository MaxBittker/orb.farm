//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]
extern crate sandtable;
use sandtable::utils::*;

extern crate wasm_bindgen_test;
use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn pass() {
    for i in 0..28 {
        let (dx, dy) = rand_vec_8();
        let packed = join_dx_dy(dx, dy, i);
        let (dxu, dyu, remu) = split_dx_dy(packed);

        assert_eq!(dx, dxu);
        assert_eq!(dy, dyu);
        assert_eq!(i, remu);
    }
}
