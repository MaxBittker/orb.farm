#ifndef SANDTABLE_BG_3_H_GENERATED_
#define SANDTABLE_BG_3_H_GENERATED_
#ifdef __cplusplus
extern "C" {
#endif

#include <stdint.h>

#include "wasm-rt.h"

#ifndef WASM_RT_MODULE_PREFIX
#define WASM_RT_MODULE_PREFIX
#endif

#define WASM_RT_PASTE_(x, y) x ## y
#define WASM_RT_PASTE(x, y) WASM_RT_PASTE_(x, y)
#define WASM_RT_ADD_PREFIX(x) WASM_RT_PASTE(WASM_RT_MODULE_PREFIX, x)

/* TODO(binji): only use stdint.h types in header */
typedef uint8_t u8;
typedef int8_t s8;
typedef uint16_t u16;
typedef int16_t s16;
typedef uint32_t u32;
typedef int32_t s32;
typedef uint64_t u64;
typedef int64_t s64;
typedef float f32;
typedef double f64;

extern void WASM_RT_ADD_PREFIX(init)(void);

/* import: './sandtable' '__wbg_random_58bd29ed438c19c0' */
extern f64 (*Z_Z2EZ2FsandtableZ___wbg_random_58bd29ed438c19c0Z_dv)(void);
/* import: './sandtable' '__wbindgen_throw' */
extern void (*Z_Z2EZ2FsandtableZ___wbindgen_throwZ_vii)(u32, u32);

/* export: 'memory' */
extern wasm_rt_memory_t (*WASM_RT_ADD_PREFIX(Z_memory));
/* export: '__wbg_cell_free' */
extern void (*WASM_RT_ADD_PREFIX(Z___wbg_cell_freeZ_vi))(u32);
/* export: '__wbg_universe_free' */
extern void (*WASM_RT_ADD_PREFIX(Z___wbg_universe_freeZ_vi))(u32);
/* export: 'universe_reset' */
extern void (*WASM_RT_ADD_PREFIX(Z_universe_resetZ_vi))(u32);
/* export: 'universe_tick' */
extern void (*WASM_RT_ADD_PREFIX(Z_universe_tickZ_vi))(u32);
/* export: 'universe_width' */
extern u32 (*WASM_RT_ADD_PREFIX(Z_universe_widthZ_ii))(u32);
/* export: 'universe_height' */
extern u32 (*WASM_RT_ADD_PREFIX(Z_universe_heightZ_ii))(u32);
/* export: 'universe_cells' */
extern u32 (*WASM_RT_ADD_PREFIX(Z_universe_cellsZ_ii))(u32);
/* export: 'universe_winds' */
extern u32 (*WASM_RT_ADD_PREFIX(Z_universe_windsZ_ii))(u32);
/* export: 'universe_burns' */
extern u32 (*WASM_RT_ADD_PREFIX(Z_universe_burnsZ_ii))(u32);
/* export: 'universe_paint' */
extern void (*WASM_RT_ADD_PREFIX(Z_universe_paintZ_viiiii))(u32, u32, u32, u32, u32);
/* export: 'universe_push_undo' */
extern void (*WASM_RT_ADD_PREFIX(Z_universe_push_undoZ_vi))(u32);
/* export: 'universe_pop_undo' */
extern void (*WASM_RT_ADD_PREFIX(Z_universe_pop_undoZ_vi))(u32);
/* export: 'universe_flush_undos' */
extern void (*WASM_RT_ADD_PREFIX(Z_universe_flush_undosZ_vi))(u32);
/* export: 'universe_new' */
extern u32 (*WASM_RT_ADD_PREFIX(Z_universe_newZ_iii))(u32, u32);
/* export: '__wbg_wind_free' */
extern void (*WASM_RT_ADD_PREFIX(Z___wbg_wind_freeZ_vi))(u32);
#ifdef __cplusplus
}
#endif

#endif  /* SANDTABLE_BG_3_H_GENERATED_ */
