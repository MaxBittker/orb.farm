extern crate cfg_if;
extern crate js_sys;
extern crate wasm_bindgen;
extern crate web_sys;

mod species;
mod utils;
use utils::*;

use species::Species;
use std::collections::VecDeque;
use std::f32;
// use std::float;
use wasm_bindgen::prelude::*;
// use web_sys::console;
#[wasm_bindgen]
#[repr(C)]
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Light {
    sun: u8,
    g: u8,
    b: u8,
    a: u8,
}

#[wasm_bindgen]
#[repr(C)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Cell {
    species: Species,
    energy: u8,
    age: u8,
    clock: u8,
}

impl Cell {
    pub fn new(species: Species) -> Cell {
        Cell {
            species: species,
            energy: 100 + (js_sys::Math::random() * 50.) as u8,
            age: 0,
            clock: 0,
        }
    }

    pub fn update(&self, api: SandApi) {
        self.species.update(*self, api);
    }
    pub fn blocked_light(&self) -> f32 {
        self.species.blocked_light()
    }
}

static EMPTY_CELL: Cell = Cell {
    species: Species::Air,
    energy: 0,
    age: 0,
    clock: 0,
};

static WASTE: Cell = Cell {
    species: Species::Waste,
    energy: 0,
    age: 0,
    clock: 0,
};

#[wasm_bindgen]
pub struct Universe {
    width: i32,
    height: i32,
    cells: Vec<Cell>,
    undo_stack: VecDeque<Vec<Cell>>,
    lights: Vec<Light>,
    generation: u8,
    time: u8,
    total_gas: u32,
    o2: u32,
    co2: u32,
}

pub struct SandApi<'a> {
    x: i32,
    y: i32,
    universe: &'a mut Universe,
}

impl<'a> SandApi<'a> {
    pub fn get(&mut self, dx: i32, dy: i32) -> Cell {
        if dx > 2 || dx < -2 || dy > 2 || dy < -2 {
            panic!("oob get");
        }
        let nx = self.x + dx;
        let ny = self.y + dy;
        if nx < 0 || nx > self.universe.width - 1 || ny < 0 || ny > self.universe.height - 1 {
            return Cell {
                species: Species::Air,
                energy: 0,
                age: 0,
                clock: self.universe.generation,
            };
        }
        self.universe.get_cell(nx, ny)
    }
    pub fn set(&mut self, dx: i32, dy: i32, v: Cell) {
        if dx > 1 || dx < -1 || dy > 2 || dy < -2 {
            panic!("oob set");
        }
        let nx = self.x + dx;
        let ny = self.y + dy;

        if nx < 0 || nx > self.universe.width - 1 || ny < 0 || ny > self.universe.height - 1 {
            return;
        }
        let i = self.universe.get_index(nx, ny);
        // v.clock += 1;
        self.universe.cells[i] = v;
        self.universe.cells[i].clock = self.universe.generation;
    }

    pub fn get_light(&mut self) -> Light {
        let idx = self.universe.get_index(self.x, self.y);

        self.universe.lights[idx]
    }
    pub fn use_co2(&mut self) -> bool {
        if (1 + rand_int(self.universe.total_gas as i32 / 3) as u32) > self.universe.co2 {
            return false;
        }
        self.universe.co2 = self.universe.co2.saturating_sub(1);
        self.universe.o2 = self.universe.o2.saturating_add(1);

        return true;
    }
    pub fn can_use_oxygen(&mut self) -> bool {
        (1 + rand_int(self.universe.total_gas as i32 / 3) as u32) < self.universe.o2
    }

    pub fn use_oxygen(&mut self) -> bool {
        if !self.can_use_oxygen() {
            return false;
        }
        self.universe.o2 = self.universe.o2.saturating_sub(1);
        self.universe.co2 = self.universe.co2.saturating_add(1);

        return true;
    }
}

#[wasm_bindgen]
impl Universe {
    pub fn reset(&mut self) {
        for x in 0..self.width {
            for y in 0..self.height {
                let idx = self.get_index(x, y);
                self.cells[idx] = EMPTY_CELL;
            }
        }
    }
    pub fn calculate_light(&mut self) {
        let time = ((self.time as f32) / 255.) * f32::consts::PI * 2.;

        // let time: f32 = 0.1;
        let mut dx = time.sin();
        let mut dy = time.cos();

        let mut brightness = 255.0;
        if dy < 0.5 {
            brightness = 30.0 + (225.0 * (dy / 0.5)) as f32;
        }
        if dy < -0.1 {
            dx = 0.0;
            dy = 1.0;
        }

        let start_y = if dy > 0. { 0 } else { self.height - 1 };
        for start_x in 0..self.width {
            self.cast_ray(brightness, start_x, start_y, dx, dy);
        }

        let start_x = if dx > 0. { 0 } else { self.width - 1 };
        for start_y in 0..self.height {
            self.cast_ray(brightness, start_x, start_y, dx, dy);
        }
    }
    pub fn cast_ray(&mut self, brightness: f32, x: i32, y: i32, dx: f32, dy: f32) {
        let ray_length =
            (((self.width * self.width) + (self.height * self.height)) as f32).sqrt() as i32;

        let mut sunlight: f32 = brightness;
        for r in 0..ray_length {
            let rx = (r as f32 * dx) as i32 + x;
            let ry = (r as f32 * dy) as i32 + y;

            let idx = self.get_index(rx, ry);
            if rx < 0
                || ry < 0
                || rx >= self.width
                || ry >= self.height
                || idx > self.get_max_index()
            {
                break;
            }
            let cell = self.get_cell(rx, ry);
            sunlight = (sunlight) * cell.blocked_light();

            self.lights[idx].sun = sunlight as u8;
        }
    }

    pub fn tick(&mut self) {
        // let mut next = self.cells.clone();
        // let dx = self.winds[(self.width * self.height / 2) as usize].dx;
        // let js: JsValue = (dx).into();
        // console::log_2(&"dx: ".into(), &js);

        self.generation = self.generation.wrapping_add(1) % 2;
        for x in 0..self.width {
            let scanx = if self.generation % 2 == 0 {
                self.width - (1 + x)
            } else {
                x
            };

            for y in 0..self.height {
                // let idx = self.get_index(scanx, self.height - (1 + y));
                let cell = self.get_cell(scanx, y);

                Universe::update_cell(
                    cell,
                    SandApi {
                        universe: self,
                        x: scanx,
                        y,
                    },
                );
            }
        }
        // self.time = self.time.wrapping_add(1);
        self.calculate_light();
    }

    pub fn width(&self) -> i32 {
        self.width
    }

    pub fn height(&self) -> i32 {
        self.height
    }

    pub fn o2(&self) -> u32 {
        self.o2
    }
    pub fn total_gas(&self) -> u32 {
        self.total_gas
    }
    pub fn co2(&self) -> u32 {
        self.co2
    }
    pub fn cells(&self) -> *const Cell {
        self.cells.as_ptr()
    }
    pub fn lights(&self) -> *const Light {
        self.lights.as_ptr()
    }

    pub fn paint(&mut self, x: i32, y: i32, size: i32, species: Species) {
        let mut radius = size / 2;

        if species == Species::Fish || species == Species::Zoop || species == Species::Bacteria {
            radius = 1;
        }
        for dx in -radius..radius {
            for dy in -radius..radius {
                if (dx * dx * 4) + (dy * dy * 4) > (size * size) - 2 {
                    continue;
                };
                let px = x + dx;
                let py = y + dy;

                let i = self.get_index(px, py);

                if px < 0 || px > self.width - 1 || py < 0 || py > self.height - 1 {
                    continue;
                }
                if self.get_cell(px, py).species == Species::Water
                    || self.get_cell(px, py).species == Species::Air
                    || species == Species::Air
                {
                    self.cells[i] = Cell {
                        species: species,
                        energy: 80
                            + (js_sys::Math::random() * 30.) as u8
                            + ((self.generation % 127) as i8 - 60).abs() as u8,
                        age: 0,
                        clock: self.generation,
                    }
                }
            }
        }
    }

    pub fn push_undo(&mut self) {
        self.undo_stack.push_front(self.cells.clone());
        self.undo_stack.truncate(50);
    }

    pub fn pop_undo(&mut self) {
        let old_state = self.undo_stack.pop_front();
        match old_state {
            Some(state) => self.cells = state,
            None => (),
        };
    }

    pub fn flush_undos(&mut self) {
        self.undo_stack.clear();
    }
    pub fn set_time(&mut self, t: u8) {
        self.time = t;
    }
    pub fn inc_time(&mut self) {
        self.time = self.time.wrapping_add(1);
    }

    pub fn new(width: i32, height: i32) -> Universe {
        let cells = (0..width * height).map(|_| EMPTY_CELL).collect();

        let lights: Vec<Light> = (0..width * height)
            .map(|_i| Light {
                sun: 0,
                g: 0,
                b: 0,
                a: 0,
            })
            .collect();
        let total_gas = (width * height * 10) as u32;
        Universe {
            width,
            height,
            cells,
            lights,
            time: 0,
            total_gas,
            o2: total_gas / 2,
            co2: total_gas / 2,
            undo_stack: VecDeque::with_capacity(50),
            generation: 0,
        }
    }
}

//private methods
impl Universe {
    fn get_index(&self, x: i32, y: i32) -> usize {
        (x + (y * self.width)) as usize
    }
    fn get_max_index(&self) -> usize {
        let m_w = (self.width - 1) as usize;
        let m_h = self.height - 1;
        return (m_w + (m_h * self.width) as usize) as usize;
    }

    fn get_cell(&self, x: i32, y: i32) -> Cell {
        let i = self.get_index(x, y);
        return self.cells[i];
    }

    // fn get_light(&self, x: i32, y: i32) -> Light {
    //     let i = self.get_index(x, y);
    //     return self.lights[i];
    // }

    fn update_cell(cell: Cell, api: SandApi) {
        if cell.clock == api.universe.generation {
            return;
        }

        cell.update(api);
    }
}
