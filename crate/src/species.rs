use super::utils::*;
use Cell;

// use Light;
use SandApi;
use EMPTY_CELL;

// use std::cmp;
use std::mem;
use wasm_bindgen::prelude::*;
// use web_sys::console;

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Species {
    Air = 0,
    Glass = 1,
    Sand = 2,
    Water = 3,

    Algae = 4,
    Plant = 5,

    Zoop = 6,
    Shrimp = 7,

    Bacteria = 8,
    // Anaerobic = 9,
    Waste = 10,
    Seed = 11,
    Stone = 12,
}

impl Species {
    pub fn update(&self, cell: Cell, api: SandApi) {
        match self {
            Species::Air => {}
            Species::Glass => {}

            Species::Water => update_water(cell, api),
            Species::Sand => update_sand(cell, api),
            Species::Stone => update_stone(cell, api),

            // Species::Anaerobic => {}
            Species::Bacteria => {}
            Species::Zoop => {}
            Species::Waste => update_waste(cell, api),
            Species::Algae => {}

            // Species::Dust => update_dust(cell, api),
            Species::Shrimp => update_shrimp(cell, api),
            Species::Plant => update_plant(cell, api),
            Species::Seed => update_seed(cell, api),
        }
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
pub fn update_sand(cell: Cell, mut api: SandApi) {
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
        api.set(0, 0, dx0r);
        api.set(-dx, 0, cell);
    } else if dx1.species == Species::Air {
        api.set(0, 0, dx1);
        api.set(dx, 1, cell);
    } else if dx1r.species == Species::Air {
        api.set(0, 0, dx1r);
        api.set(-dx, 1, cell);
    }
}
pub fn update_dust(cell: Cell, mut api: SandApi) {
    let dx = rand_dir();

    let down = api.get(0, 1);
    let nbr = api.get(dx, 1);
    if down.species == Species::Air {
        api.set(0, 0, EMPTY_CELL);
        api.set(0, 1, cell);
    } else if nbr.species == Species::Water {
        api.set(0, 0, nbr);
        api.set(dx, 1, cell);
    } else if nbr.species == Species::Air {
        api.set(0, 0, EMPTY_CELL);
        api.set(dx, 1, cell);
    }
}
pub fn update_shrimp(cell: Cell, mut api: SandApi) {
    let down = api.get(0, 1);
    if down.species == Species::Air {
        api.set(0, 0, EMPTY_CELL);
        api.set(0, 1, cell);

        return;
    }
    let (dx, dy) = rand_vec();
    if cell.age > 250 {
        api.set(0, 0, Cell::new(Species::Waste));
        return;
    }
    let nbr = api.get(dx, dy);
    if nbr.species == Species::Water {
        api.set(0, 0, nbr);
        api.set(
            dx,
            dy,
            Cell {
                energy: cell.energy,
                age: cell.age + 1,
                ..cell
            },
        );
        if api.use_oxygen() {
            api.set(
                0,
                0,
                Cell {
                    energy: cell.energy / 2,
                    age: 0,
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
    // let rb = cell.rb;

    let mut i = rand_int(100);
    let dx = rand_dir();
    let dy = -1;

    let nbr_species = api.get(dx, dy).species;
    let light = api.get_light().sun;
    if rand_int(light as i32) > 200
        && (nbr_species == Species::Water
            && api.get(0, dy).species == Species::Water
            && api.get(-dx, dy).species == Species::Water
            && api.get(dx * 2, dy).species == Species::Water
            && api.use_co2())
    {
        i = rand_int(100);
        let drift = (i % 15) - 7;
        let newra = (cell.energy as i32 + drift) as u8;
        api.set(
            dx,
            dy,
            Cell {
                energy: newra,
                age: 0,
                ..cell
            },
        );
        // api.set(-dx, dy, EMPTY_CELL);
    }

    // if rb > 1 {
    //     api.set(
    //         0,
    //         0,
    //         Cell {
    //             ra: cell.ra,
    //             rb: rb - 1,
    //             ..cell
    //         },
    //     );

    //     if nbr_species == Species::Water {
    //         api.set(
    //             0,
    //             0,
    //             Cell {
    //                 ra: 50,
    //                 rb: 0,
    //                 ..cell
    //             },
    //         )
    //     }
    // } else if rb == 1 {
    //     api.set(0, 0, EMPTY_CELL);
    // }
    // let ra = cell.ra;
    // if light > 50
    //     && api.get(1, 1).species != Species::Plant
    //     && api.get(-1, 1).species != Species::Plant
    // {
    //     if api.get(0, 1).species == Species::Air {
    //         let i = (js_sys::Math::random() * js_sys::Math::random() * 100.) as i32;
    //         let dec = rand_int(30) - 20;
    //         if (i + ra as i32) > 165 {
    //             api.set(
    //                 0,
    //                 1,
    //                 Cell {
    //                     ra: (ra as i32 + dec) as u8,
    //                     ..cell
    //                 },
    //             );
    //         }
    //     } else {
    //         api.set(
    //             0,
    //             0,
    //             Cell {
    //                 ra: (ra - 1) as u8,
    //                 ..cell
    //             },
    //         );
    //     }
    // }
}

pub fn update_seed(cell: Cell, mut api: SandApi) {
    let age = cell.age;
    let energy = cell.energy;

    let (dx, dy) = rand_vec();

    let nbr_species = api.get(dx, dy).species;

    if age == 0 {
        //falling

        let dxf = rand_dir(); //falling dx
        let nbr_species_below = api.get(dxf, 1).species;
        if nbr_species_below == Species::Sand || nbr_species_below == Species::Plant {
            api.set(
                0,
                0,
                Cell {
                    age: (rand_int(253) + 1) as u8,
                    ..cell
                },
            );
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
    } else {
        if energy > 60 {
            //stem
            let dxr = rand_dir(); //raising dx
            if rand_int(100) > 75 {
                if (api.get(dxr, -1).species == Species::Air
                    || api.get(dxr, -1).species == Species::Sand
                    || api.get(dxr, -1).species == Species::Seed)
                    && api.get(1, -1).species != Species::Plant
                    && api.get(-1, -1).species != Species::Plant
                {
                    api.set(
                        dxr,
                        -1,
                        Cell {
                            energy: (energy as i32 - rand_int(10)) as u8,
                            ..cell
                        },
                    );
                    api.set(
                        0,
                        0,
                        Cell {
                            species: Species::Plant,
                            energy: 80 + (js_sys::Math::random() * 30.) as u8,
                            age: 0,
                            clock: 0,
                        },
                    )
                } else {
                    api.set(0, 0, EMPTY_CELL);
                }
            }
        } else {
            if nbr_species == Species::Water {
                api.set(dx, dy, Cell::new(Species::Seed))
            }
        }
    }
}

// pub fn update_mite(cell: Cell, mut api: SandApi) {
//     let mut i = rand_int(100);
//     let mut dx = 0;
//     if cell.ra < 20 {
//         dx = (cell.ra as i32) - 1;
//     }
//     let mut dy = 1;
//     let mut mite = cell.clone();

//     if cell.rb > 10 {
//         // /
//         mite.rb = mite.rb.saturating_sub(1);
//         dy = -1;
//     } else if cell.rb > 1 {
//         // \
//         mite.rb = mite.rb.saturating_sub(1);
//     } else {
//         // |
//         dx = 0;
//     }
//     let nbr = api.get(dx, dy);

//     let sx = (i % 3) - 1;
//     i = rand_int(1000);
//     let sy = (i % 3) - 1;
//     let sample = api.get(sx, sy).species;

//     if (sample == Species::Plant || sample == Species::Seed) && i > 800 {
//         api.set(0, 0, EMPTY_CELL);
//         api.set(sx, sy, cell);

//         return;
//     }

//     if nbr.species == Species::Air {
//         api.set(0, 0, EMPTY_CELL);
//         api.set(dx, dy, mite);
//     } else if dy == 1 && i > 800 {
//         i = rand_int(100);
//         let mut ndx = (i % 3) - 1;
//         if i < 6 {
//             //switch direction
//             ndx = dx;
//         }

//         mite.ra = (1 + ndx) as u8;
//         mite.rb = 10 + (i % 10) as u8; //hop height

//         api.set(0, 0, mite);
//     } else {
//         if api.get(-1, 0).species == Species::Mite
//             && api.get(1, 0).species == Species::Mite
//             && api.get(0, -1).species == Species::Mite
//         {
//             api.set(0, 0, EMPTY_CELL);
//         } else {
//             api.set(0, 0, mite);
//         }
//     }
// }
