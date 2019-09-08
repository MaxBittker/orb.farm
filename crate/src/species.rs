use super::utils::*;
use Cell;

// use Light;
use SandApi;
use EMPTY_CELL;
use WASTE;

use std::cmp;
// use std::mem;
use wasm_bindgen::prelude::*;
use web_sys::console;

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Species {
    Air = 0,

    Glass = 1,
    Sand = 2,
    Stone = 12,
    Wood = 13,

    Water = 3,

    Algae = 4,
    Zoop = 6,
    Daphnia = 14,

    Seed = 11,

    Plant = 5,

    Bacteria = 8,

    Fish = 7,
    FishTail = 15,

    Nitrogen = 9,

    Waste = 10,
    Bubble = 16,
}

impl Species {
    pub fn update(&self, cell: Cell, api: SandApi) {
        match self {
            Species::Air => {}
            Species::Glass => {}

            Species::Water => update_water(cell, api),
            Species::Sand => update_sand(cell, api),
            Species::Stone => update_stone(cell, api),
            Species::Wood => {}

            Species::Bacteria => update_bacteria(cell, api),
            Species::Zoop => update_zoop(cell, api),
            Species::Daphnia => update_Daphnia(cell, api),
            Species::Waste => update_waste(cell, api),
            Species::Nitrogen => update_nitrogen(cell, api),
            Species::Algae => update_algae(cell, api),

            Species::Fish => update_fish(cell, api),
            Species::FishTail => update_fishtail(cell, api),
            Species::Plant => update_plant(cell, api),
            Species::Seed => update_seed(cell, api),
            Species::Bubble => update_bubble(cell, api),
        }
    }
    pub fn blocked_light(&self) -> f32 {
        (100.0
            - match self {
                Species::Water => 1.0,
                Species::Fish => 25.0,
                Species::FishTail => 25.0,

                Species::Plant => 20.0,
                Species::Seed => 35.0,

                Species::Algae => 20.0,
                Species::Bacteria => 10.0,
                Species::Waste => 10.0,
                Species::Nitrogen => 10.0,
                Species::Zoop => 10.0,
                Species::Daphnia => 5.0,

                Species::Air => 0.0,
                Species::Bubble => 2.0,
                Species::Glass => 0.0,

                Species::Stone => 50.0,
                Species::Wood => 50.0,
                Species::Sand => 10.0,
            })
            / 100.0
    }
}

pub fn update_waste(cell: Cell, mut api: SandApi) {
    let dx = rand_dir_2();

    let nbr = api.get(0, 1);
    let dnbr = api.get(dx, 1);
    if nbr.species == Species::Air || nbr.species == Species::Water {
        api.set(0, 0, nbr);
        api.set(0, 1, cell);
    } else if dnbr.species == Species::Air || dnbr.species == Species::Water {
        api.set(0, 0, dnbr);
        api.set(dx, 1, cell);
    }
}
pub fn update_fishtail(cell: Cell, mut api: SandApi) {
    let age = cell.age;
    if age == 0 {
        api.set(0, 0, Cell::new(Species::Water));

        let energy = cell.energy;
        let species = if energy == 2 {
            //dead
            Species::Waste
        } else {
            Species::FishTail
        };
        if energy == 1 {
            //fin
            let fin_cell = Cell {
                species,
                energy: 0,
                age: 0,
                ..cell
            };
            api.set(0, 0, fin_cell);

            if api.get(0, 1).species == Species::Water {
                api.set(0, 1, fin_cell);
            }
            if api.get(0, -1).species == Species::Water {
                api.set(0, -1, fin_cell);
            }
        }
    } else {
        api.set(
            0,
            0,
            Cell {
                age: age - 1,
                ..cell
            },
        );
    }
}

pub fn update_nitrogen(cell: Cell, mut api: SandApi) {
    let dx = rand_dir_2();

    let nbr = api.get(0, 1);
    if cell.age > 200 {
        api.set(0, 0, Cell::new(Species::Water));
        return;
    }
    if nbr.species == Species::Sand || nbr.species == Species::Plant {
        api.set(0, 0, Cell::new(Species::Bubble));
        api.set(
            0,
            1,
            Cell {
                energy: nbr.energy.saturating_add(200),
                ..nbr
            },
        );
        return;
    }
    let dnbr = api.get(dx, 1);
    if nbr.species == Species::Air
        || nbr.species == Species::Water
        || nbr.species == Species::Zoop
        || nbr.species == Species::Bacteria
        || nbr.species == Species::Daphnia
    {
        api.set(0, 0, nbr);
        api.set(0, 1, cell);
    } else if dnbr.species == Species::Air || dnbr.species == Species::Water {
        api.set(0, 0, dnbr);
        api.set(dx, 1, cell);
    } else if nbr.species == Species::Waste {
        api.set(0, 0, nbr);
        api.set(0, 1, cell);
    } else {
        api.set(
            0,
            0,
            Cell {
                age: cell.age.saturating_add(rand_int(3) as u8),
                ..cell
            },
        )
    }
}

pub fn update_bacteria(cell: Cell, mut api: SandApi) {
    if !once_in(7) {
        return;
    }
    let energy = cell.energy;
    let (dx, dy) = rand_vec_8();

    let down = api.get(0, 1);
    let nbr = api.get(dx, 1);

    let sample = api.get(dx, dy);

    if sample.species == Species::Waste || (energy < 40 && sample.species == Species::Bacteria) {
        let mut new_energy = energy / 2;
        if new_energy > 120 {
            api.set(
                0,
                0,
                Cell {
                    energy: new_energy,
                    ..cell
                },
            );
        } else {
            api.set(0, 0, Cell::new(Species::Nitrogen));
            new_energy = energy;
        }
        api.set(
            dx,
            dy,
            Cell {
                energy: new_energy.saturating_add(50),
                ..cell
            },
        );
        api.use_oxygen();
        api.use_oxygen();

        return;
    }

    if down.species == Species::Air || down.species == Species::Water {
        api.set(0, 0, down);
        api.set(0, 1, cell);
        return;
    } else if nbr.species == Species::Air {
        api.set(0, 0, nbr);
        api.set(dx, 1, cell);
        return;
    }

    let (rdx, rdy) = adjacency_right((dx, dy));
    let (ldx, ldy) = adjacency_left((dx, dy));
    let r_sample = api.get(rdx, rdy).species;
    let l_sample = api.get(ldx, ldy).species;

    if sample.species == Species::Water
        && (r_sample != Species::Water || l_sample != Species::Water)
    {
        api.set(0, 0, sample);
        api.set(dx, dy, cell);
        return;
    }

    api.use_oxygen();

    api.set(
        0,
        0,
        Cell {
            energy: energy.saturating_sub(api.universe.generation % 2),
            ..cell
        },
    )
}

pub fn update_sand(cell: Cell, mut api: SandApi) {
    let mut age = cell.age;
    if cell.age == 0 {
        age = rand_int(255) as u8;
    }

    let (dx, dy) = rand_vec_8();

    let down = api.get(0, 1);
    let dnbr = api.get(dx, 1);
    if down.species == Species::Air {
        api.set(0, 0, EMPTY_CELL);
        api.set(0, 1, cell);
        return;
    } else if dnbr.species == Species::Water {
        api.set(0, 0, dnbr);
        api.set(dx, 1, cell);
        return;
    } else if dnbr.species == Species::Air {
        api.set(0, 0, EMPTY_CELL);
        api.set(dx, 1, cell);
        return;
    }
    let energy = cell.energy;

    let nbr = api.get(dx, dy);

    if rand_int(257 - cell.energy as i32) == 1 && nbr.species == Species::Sand {
        //diffuse nutrients

        let shared_energy = (energy / 2) + (nbr.energy / 2);

        let new_energy = (energy / 2).saturating_add(shared_energy / 2) as u8;
        let new_nbr_energy = (nbr.energy / 2).saturating_add(shared_energy / 2) as u8;

        let conservation = (nbr.energy + energy) - (new_nbr_energy + new_energy);

        api.set(
            dx,
            dy,
            Cell {
                energy: new_nbr_energy.saturating_add(conservation),
                ..nbr
            },
        );
        api.set(
            0,
            0,
            Cell {
                energy: new_energy,
                age,
                ..cell
            },
        );
    }

    // let dx = rand_dir_2();

    // let nbr = api.get(0, 1);
    // let dnbr = api.get(dx, 1);
    // if nbr.species == Species::Air || nbr.species == Species::Water {
    //     api.set(0, 0, nbr);
    //     api.set(0, 1, cell);
    // } else if dnbr.species == Species::Air || dnbr.species == Species::Water {
    //     api.set(0, 0, dnbr);
    //     api.set(dx, 1, cell);
    // }
}
pub fn update_water(cell: Cell, mut api: SandApi) {
    let dx = rand_dir();
    let below = api.get(0, 1);
    let dx1 = api.get(dx, 1);
    let dx1r = api.get(-dx, 1);
    let dx0 = api.get(dx, 0);
    let dx0r = api.get(-dx, 0);
    if below.species == Species::Air {
        api.set(0, 0, below);
        api.set(0, 1, cell);
    } else if dx0.species == Species::Air {
        api.set(0, 0, dx0);
        api.set(dx, 0, cell);
    } else if dx0r.species == Species::Air {
        api.set(-dx, 0, cell);
        // if api.get(dx * -2, 0).species == Species::Water
        //     && dx0.species == Species::Water
        //     && api.get(0, -1).species == Species::Air
        //     && rand_int(5) == 1
        // {
        //     api.set(0, 0, Cell::new(Species::Water));
        // } else {
        api.set(0, 0, dx0r);
    // }
    } else if dx1.species == Species::Air {
        api.set(0, 0, dx1);
        api.set(dx, 1, cell);
    } else if dx1r.species == Species::Air {
        api.set(0, 0, dx1r);
        api.set(-dx, 1, cell);
    }
}

pub fn update_algae(cell: Cell, mut api: SandApi) {
    let down = api.get(0, 1);
    if down.species == Species::Air {
        api.set(0, 0, EMPTY_CELL);
        api.set(0, 1, cell);

        return;
    }
    let (mut dx, mut dy) = rand_vec_8();
    if rand_int(20) < 19 {
        return;
    }
    if cell.age > 200 {
        //old age
        api.set(0, 0, Cell::new(Species::Waste));
        return;
    }
    let nbr = api.get(dx, dy);
    let mut split_energy = 0;

    if nbr.species != Species::Water && nbr.species != Species::Algae {
        dx = 0;
        dy = 0;
    } else {
        if cell.age > 10 && cell.energy > 220 && api.get(-dx, -dy).species == Species::Water {
            split_energy = cell.energy / 2;
            api.set(
                0,
                0,
                Cell {
                    energy: split_energy.saturating_sub(100), //cost of reproduction
                    age: 0,
                    ..cell
                },
            );
        }
    }

    if split_energy == 0 {
        api.set(0, 0, nbr);
    }
    let mut photosynth: u8 = api.get_light().sun.saturating_sub(30) / 4;
    if photosynth > 0 && !api.use_co2() {
        photosynth = 0; //need co2
    }

    api.set(
        dx,
        dy,
        Cell {
            energy: cell
                .energy
                .saturating_add(photosynth)
                .saturating_sub(3) //cost of life
                .saturating_sub(split_energy),
            age: cell.age.saturating_add(api.universe.generation),
            ..cell
        },
    );
}
const ZOOP_PADDING: u8 = 4;
const GLIDE_LENGTH: u8 = 6;

pub fn update_zoop(cell: Cell, mut api: SandApi) {
    let down = api.get(0, 1);

    if down.species == Species::Air {
        api.set(0, 0, down);
        api.set(0, 1, cell);
        return;
    }
    let age = cell.age;
    let energy = cell.energy;
    let (sx, sy) = rand_vec_8();
    let sample = api.get(sx, sy);
    api.use_oxygen();
    if sample.species == Species::Algae || sample.species == Species::Daphnia {
        api.set(
            0,
            0,
            Cell {
                energy: energy.saturating_add(40 + sample.energy / 2),
                ..cell
            },
        );
        api.set(sx, sy, Cell::new(Species::Water));

        if energy > 230 && api.use_oxygen() {
            let new_energy = energy / 4;
            api.set(
                sx,
                sy,
                Cell {
                    species: Species::Daphnia,
                    energy: new_energy * 3,
                    age: 0,
                    ..cell
                },
            );

            api.set(
                0,
                0,
                Cell {
                    energy: new_energy,
                    ..cell
                },
            );
        }
        return;
    }

    if energy == 0 {
        api.set(0, 0, WASTE);
        return;
    }
    let sun = api.get_light().sun;
    if age < ZOOP_PADDING || sun > 150 {
        //sinking
        let dx = rand_dir();
        let dy = rand_int(2);
        let down = api.get(dx, dy);
        if (down.species == Species::Water) && rand_int(5) == 0 {
            api.set(0, 0, down);
            api.set(
                dx,
                dy,
                Cell {
                    age: age + rand_int(2) as u8,
                    ..cell
                },
            );
        } else {
            api.set(
                0,
                0,
                Cell {
                    age: age + rand_int(2) as u8,
                    ..cell
                },
            );
        }
    } else if age == ZOOP_PADDING {
        // kick
        let (mut dx, mut dy) = if api.get_light().sun < 30 {
            rand_vec_up_3() // climb at night
        } else {
            rand_vec_8() // wander
        }; // pointed up
        let nbr = api.get(dx, dy);
        if nbr.species != Species::Water {
            dx *= -1;
            dy *= -1;
        }
        if api.use_oxygen() {
            api.set(
                0,
                0,
                Cell {
                    age: ZOOP_PADDING + join_dy_dx(dx, dy, 0),
                    energy: energy.saturating_sub(1),

                    ..cell
                },
            );
        } else {
            api.set(
                0,
                0,
                Cell {
                    energy: energy.saturating_sub(1),
                    ..cell
                },
            );
        }
    } else {
        //gliding
        let (dx, dy, rem) = split_dy_dx(cell.age - ZOOP_PADDING);
        if rem > GLIDE_LENGTH {
            api.set(0, 0, Cell { age: 0, ..cell });
            return;
        }
        let nbr = api.get(dx, dy);
        //   api.use_oxygen()
        if nbr.species == Species::Water && (api.use_oxygen()) {
            api.set(0, 0, nbr);
            // api.set(0, dy, Cell::new(clone_species));

            let (ndx, ndy) = match rand_int(100) % 50 {
                0 => adjacency_left((dx, dy)),
                1 => adjacency_right((dx, dy)),
                _ => (dx, dy),
            };
            api.set(
                dx,
                dy,
                Cell {
                    age: ZOOP_PADDING + join_dy_dx(ndx, ndy, rem + 1),
                    // energy: energy.saturating_sub(cell.clock),
                    ..cell
                },
            );
        } else {
            api.set(
                0,
                0,
                Cell {
                    age: ZOOP_PADDING + join_dy_dx(dx, dy, GLIDE_LENGTH + 1),
                    energy: energy.saturating_sub(cell.clock),
                    ..cell
                },
            );
        }
    }
}

pub fn update_Daphnia(cell: Cell, mut api: SandApi) {
    let dx = rand_dir();
    if cell.age > 250 && api.use_oxygen() {
        // hatch
        api.set(
            0,
            0,
            Cell {
                species: Species::Zoop,
                age: 0,
                energy: 250,
                ..cell
            },
        );

        return;
    }
    let dy = rand_int(2);
    let dnbr = api.get(dx * dy, dy);
    if dnbr.species == Species::Air || dnbr.species == Species::Water {
        api.set(0, 0, dnbr);
        api.set(dx * dy, dy, cell);
    } else {
        if !api.can_use_oxygen() || api.get_light().sun > 20 {
            //gestate
            return;
        }
        api.set(
            0,
            0,
            Cell {
                age: cell
                    .age
                    .saturating_add(cell.clock * (rand_int(5) / 4) as u8),
                ..cell
            },
        );
    }
}
const FISH_PADDING: u8 = 8;
pub fn update_fish(cell: Cell, mut api: SandApi) {
    let down = api.get(0, 1);
    if down.species == Species::Air {
        api.set(0, 0, EMPTY_CELL);
        api.set(0, 1, cell);

        return;
    }
    let down = api.get(0, 1);

    if down.species == Species::Air {
        api.set(0, 0, down);
        api.set(0, 1, cell);
        return;
    }
    let age = cell.age;
    let energy = cell.energy;
    let (sx, sy) = rand_vec_8();
    let sample = api.get(sx, sy);
    // api.use_oxygen();
    // Eat
    if sample.species == Species::Zoop || (rand_int(100) == 1 && sample.species == Species::Plant) {
        api.set(
            0,
            0,
            Cell {
                energy: energy.saturating_add(100 + sample.energy),
                ..cell
            },
        );
        api.set(sx, sy, Cell::new(Species::Water));
        //reproduce
        if energy > 250 && api.use_oxygen() && rand_int(200) == 2 {
            let new_energy = energy / 4;
            api.set(
                sx,
                sy,
                Cell {
                    species: Species::Fish,
                    energy: new_energy * 3,
                    age: 0,
                    ..cell
                },
            );

            api.set(
                0,
                0,
                Cell {
                    energy: new_energy,
                    ..cell
                },
            );
        }
        return;
    }

    if energy == 0 {
        api.set(0, 0, WASTE);
        return;
    }

    if age < FISH_PADDING {
        // kick
        let (dx, mut dy) = (rand_dir_2(), 0);
        let nbr = api.get(dx, dy);
        if nbr.species != Species::Water {
            dy = rand_dir_2();
        }
        api.use_oxygen();
        api.set(
            0,
            0,
            Cell {
                age: FISH_PADDING + join_dy_dx(dx, dy, age),
                energy: energy.saturating_sub(0),
                ..cell
            },
        );
    } else {
        // swimming
        let (dx, dy, mut rem) = split_dy_dx(cell.age - FISH_PADDING);
        if once_in(90) {
            //kick
            api.set(0, 0, Cell { age: rem, ..cell });
            return;
        }
        let nbr = api.get(dx, dy);
        //   api.use_oxygen()
        if energy > 200 && once_in(1000) && rem <= FISH_PADDING - 2 {
            rem += 1;
        }
        if nbr.species == Species::Water
        // || nbr.species == Species::FishTail
        || (nbr.species == Species::Algae && once_in(2))
        // && (api.use_oxygen())
        {
            let fish_length = 1 + rem;
            api.set(
                0,
                0,
                Cell {
                    species: Species::FishTail,
                    energy: 1,
                    age: fish_length,
                    clock: cell.clock,
                },
            );
            if api.get(0, 1).species == Species::Water {
                api.set(
                    0,
                    1,
                    Cell {
                        species: Species::FishTail,
                        energy: 0,
                        age: fish_length.saturating_sub(1),
                        clock: cell.clock,
                    },
                );

                if nbr.species == Species::Algae {
                    api.set(0, 1, nbr);
                }
            }
            if api.get(0, -1).species == Species::Water {
                api.set(
                    0,
                    -1,
                    Cell {
                        species: Species::FishTail,
                        energy: 0,
                        age: fish_length.saturating_sub(2),
                        clock: cell.clock,
                    },
                );
            }

            let (ndx, ndy) = match rand_int(80) {
                0 => adjacency_left((dx, dy)),
                1 => adjacency_right((dx, dy)),
                _ => (dx, dy),
            };
            api.set(
                dx,
                dy,
                Cell {
                    age: FISH_PADDING + join_dy_dx(ndx, ndy, rem),
                    // energy: energy.saturating_sub(cell.clock),
                    ..cell
                },
            );
        } else {
            //kick
            api.set(
                0,
                0,
                Cell {
                    age: rem,
                    energy: energy.saturating_sub(cell.clock % 2),
                    ..cell
                },
            );
        }
    }
}

pub fn update_stone(cell: Cell, mut api: SandApi) {
    if api.get(-1, -1).species == Species::Stone && api.get(1, -1).species == Species::Stone {
        return;
    }

    let nbr = api.get(0, 1);
    let nbr_species = nbr.species;
    if nbr_species == Species::Air {
        api.set(0, 0, EMPTY_CELL);
        api.set(0, 1, cell);
    } else if nbr_species == Species::Water {
        api.set(0, 0, nbr);
        api.set(0, 1, cell);
    } else {
        api.set(0, 0, cell);
    }
}

pub fn update_plant(cell: Cell, mut api: SandApi) {
    let (dx, dy) = rand_vec_8();
    let energy = cell.energy;
    let age = cell.age;

    // todo slow down and give max age
    if age > 200 {
        if once_in(2) {
            api.set(0, 0, Cell::new(Species::Seed));
        } else {
            api.set(0, 0, Cell::new(Species::Waste));
        }
        return;
    }

    let light = api.get_light().sun;

    if energy > 80
        && rand_int(light as i32) > 100
        && (api.get(dx, -1).species == Species::Water
            && api.get(0, -1).species == Species::Water
            && api.get(-dx, -1).species == Species::Water
            && api.get(dx * 2, -1).species == Species::Water
            && api.get(-dx * 2, -1).species == Species::Water
            && api.use_co2())
    {
        // let i = rand_int(100);
        api.set(
            dx,
            -1,
            Cell {
                energy: 10,
                age: age.saturating_add(2),
                ..cell
            },
        );
        api.set(0, 0, Cell { energy: 10, ..cell });
        // api.set(-dx, dy, EMPTY_CELL);
        return;
    }

    if once_in(200) {
        api.use_co2();
        api.set(
            0,
            0,
            Cell {
                age: age.saturating_add(1),
                ..cell
            },
        );
        return;
    }

    let nbr = api.get(dx, dy);

    if nbr.species == Species::Plant || nbr.species == Species::Sand && dy != -1 {
        //diffuse nutrients
        if nbr.energy.saturating_sub(5) < energy {
            return;
        }
        let cappilary_action: u8 = (1 - dy) as u8 * 1; // how much to pull up
                                                       // let reserve = cmp::min(nbr.energy, 20);

        let available_nbr_energy = nbr.energy.saturating_sub(0);

        let shared_energy = ((energy / 2) + (available_nbr_energy / 2)) / 2;

        let new_energy = ((energy / 2) + (shared_energy)).saturating_add(cappilary_action) as u8;

        let new_nbr_energy =
            ((available_nbr_energy / 2) + (shared_energy)).saturating_sub(cappilary_action) as u8;

        let conservation =
            (available_nbr_energy + energy).saturating_sub(new_nbr_energy + new_energy);

        // if conservation > 10 {
        //     let mut js: JsValue = conservation.into();
        //     console::log_2(&"conservation: ".into(), &js);
        //     js = shared_energy.into();
        //     console::log_2(&"shared_energy: ".into(), &js);
        //     js = new_energy.into();
        //     console::log_2(&"new_energy: ".into(), &js);
        //     js = available_nbr_energy.into();
        //     console::log_2(&"available_nbr_energy: ".into(), &js);
        // }
        api.set(
            dx,
            dy,
            Cell {
                energy: new_nbr_energy,
                ..nbr
            },
        );
        api.set(
            0,
            0,
            Cell {
                energy: new_energy.saturating_add(conservation),
                ..cell
            },
        );
    } else {
    }
}

pub fn update_seed(cell: Cell, mut api: SandApi) {
    // let age = cell.age;
    // let energy = cell.energy;

    // let (dx, dy) = rand_vec();

    // let nbr_species = api.get(dx, dy).species;

    // if age == 0 {
    //falling

    let dxf = rand_dir(); //falling dx
    let nbr_species_below = api.get(dxf, 1).species;
    if nbr_species_below == Species::Sand || nbr_species_below == Species::Plant {
        api.set(0, 0, Cell::new(Species::Plant));
        return;
    }

    let nbr = api.get(0, 1);
    if nbr.species == Species::Air {
        api.set(0, 0, EMPTY_CELL);
        api.set(0, 1, cell);
    } else if api.get(dxf, 1).species == Species::Air {
        api.set(0, 0, EMPTY_CELL);
        api.set(dxf, 1, cell);
    } else if nbr.species == Species::Water {
        api.set(0, 0, nbr);
        api.set(0, 1, cell);
    } else {
        api.set(0, 0, cell);
    }
    // }
}

pub fn update_bubble(cell: Cell, mut api: SandApi) {
    let (dx, dy) = rand_vec_8();

    let up = api.get(0, -1);
    let up_dnbr = api.get(dx, -1);
    if api.get(dx, dy).species == Species::Air || once_in(50) {
        api.set(0, 0, Cell::new(Species::Water));
        return;
    }
    if up_dnbr.species != Species::Wood
        && up_dnbr.species != Species::Glass
        && up_dnbr.species != Species::Plant
    {
        api.set(0, 0, up_dnbr);
        api.set(dx, -1, cell);
        return;
    } else if up.species != Species::Wood
        && up.species != Species::Glass
        && up.species != Species::Plant
    {
        api.set(0, 0, up);
        api.set(0, -1, cell);
        return;
    }
}
