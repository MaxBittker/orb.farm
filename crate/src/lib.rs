extern crate cfg_if;
extern crate js_sys;
extern crate wasm_bindgen;
extern crate web_sys;

mod species;
mod utils;
use utils::*;

use species::Species;
use std::collections::VecDeque;
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
}

static EMPTY_CELL: Cell = Cell {
    species: Species::Air,
    energy: 0,
    age: 0,
    clock: 0,
};

static WATER: Cell = Cell {
    species: Species::Water,
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
    O2: u8,
    CO2: u8,
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
                species: Species::Glass,
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
        if (1 + rand_int(200) as u8) > self.universe.CO2 {
            return false;
        }
        self.universe.CO2 = self.universe.CO2.saturating_sub(1);
        self.universe.O2 = self.universe.O2.saturating_add(1);

        return true;
    }
    pub fn use_oxygen(&mut self) -> bool {
        if (1 + rand_int(200) as u8) > self.universe.O2 {
            return false;
        }
        self.universe.O2 = self.universe.O2.saturating_sub(1);
        self.universe.CO2 = self.universe.CO2.saturating_add(1);

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
        for x in 0..self.width {
            let mut sunlight: u8 = 255;

            for y in 0..self.height {
                let idx = self.get_index(x, y);
                let cell = self.get_cell(x, y);
                let block: u8 = match cell.species {
                    Species::Water => 2,
                    Species::Shrimp => 25,

                    Species::Plant => 20,
                    Species::Seed => 35,

                    Species::Algae => 20,
                    // Species::Anaerobic => 10,
                    Species::Bacteria => 10,
                    Species::Waste => 10,
                    Species::Nitrogen => 10,
                    Species::Zoop => 10,

                    Species::Air => 0,
                    Species::Glass => 0,

                    Species::Stone => 100,
                    Species::Sand => 100,
                };
                sunlight = sunlight.saturating_sub(block);

                self.lights[idx].sun = sunlight;
            }
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
        self.calculate_light();
    }

    pub fn width(&self) -> i32 {
        self.width
    }

    pub fn height(&self) -> i32 {
        self.height
    }

    pub fn O2(&self) -> u8 {
        self.O2
    }

    pub fn CO2(&self) -> u8 {
        self.CO2
    }
    pub fn cells(&self) -> *const Cell {
        self.cells.as_ptr()
    }
    pub fn lights(&self) -> *const Light {
        self.lights.as_ptr()
    }

    pub fn paint(&mut self, x: i32, y: i32, size: i32, species: Species) {
        let radius = size / 2;
        for dx in -radius..radius + 1 {
            for dy in -radius..radius + 1 {
                if dx * dx + dy * dy > (radius * radius) - 1 {
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

        Universe {
            width,
            height,
            cells,
            lights,
            time: 0,
            O2: 100,
            CO2: 100,
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
